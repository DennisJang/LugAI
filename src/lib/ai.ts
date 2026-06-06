import { countryName, type Country } from './countries';
import type { Locale } from './i18n';
import { mockScanFor, type ScanItem, type ScanResult } from './mockScan';
import { groundingText } from './regulations';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TIMEOUT_MS = 30000;
const VALID_VERDICTS = ['success', 'warning', 'danger', 'info'];

export interface JudgeParams {
  base64?: string;
  mimeType?: string;
  destination: Country;
  scannedAt: string;
  locale: Locale;
}

/**
 * 사진+목적지를 Supabase Edge Function(Claude vision)으로 보내 판정 결과를 받는다.
 * 키 미설정/이미지 없음/네트워크·서버 오류 시 mock 결과로 graceful 폴백한다.
 */
export async function judgeLuggage(params: JudgeParams): Promise<ScanResult> {
  const { base64, mimeType = 'image/jpeg', destination, scannedAt, locale } = params;

  if (!SUPABASE_URL || !ANON_KEY || !base64) {
    return mockScanFor(destination, scannedAt, locale);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/judge-luggage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        image: base64,
        mimeType,
        locale,
        destination: { code: destination.code, name: countryName(destination, locale) },
        grounding: groundingText(destination.code),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { items?: unknown };
    const items = normalizeItems(data?.items);
    if (!items.length) throw new Error('no items');
    return { destination, scannedAt, items };
  } catch {
    return mockScanFor(destination, scannedAt, locale);
  } finally {
    clearTimeout(timer);
  }
}

function normalizeItems(raw: unknown): ScanItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 15).map((r, i): ScanItem => {
    const o = (r ?? {}) as Record<string, unknown>;
    const verdict = VALID_VERDICTS.includes(String(o.verdict))
      ? (o.verdict as ScanItem['verdict'])
      : 'info';
    const emoji = typeof o.emoji === 'string' && o.emoji.trim() ? o.emoji : '📦';
    return {
      id: `ai-${i}`,
      emoji,
      name: String(o.name ?? '—'),
      verdict,
      badge: String(o.badge ?? '—'),
      reason: String(o.reason ?? ''),
      detail: String(o.detail ?? ''),
      caseNote: o.caseNote ? String(o.caseNote) : undefined,
      source: String(o.source ?? ''),
    };
  });
}
