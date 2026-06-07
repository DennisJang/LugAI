import type { Locale } from './i18n';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TIMEOUT_MS = 8000;
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 외부 예매에서 자동 수신된 다가오는 여행 (ingest-trip 웹훅 → fetch-trips). */
export interface UpcomingTrip {
  destCode: string;
  startDate: string | null;
  endDate: string | null;
  source: string | null;
}

/** 외부 자동화가 POST할 웹훅 경로(절대 URL은 EXPO_PUBLIC_SUPABASE_URL 기준). */
export const INGEST_PATH = '/functions/v1/ingest-trip';

export function ingestWebhookUrl(): string | null {
  return SUPABASE_URL ? `${SUPABASE_URL}${INGEST_PATH}` : null;
}

/** 'YYYY-MM-DD' 일자 범위를 로케일에 맞게 짧게 포맷. 타임존 이슈 없게 문자열만 파싱. */
export function formatTripDates(start: string | null, end: string | null, locale: Locale): string {
  const parse = (iso: string | null) => {
    if (!iso) return null;
    const [, m, d] = iso.split('-').map(Number);
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? { m, d } : null;
  };
  const s = parse(start);
  const e = parse(end);
  const one = s ?? e;
  if (!one) return '';
  const day = (p: { m: number; d: number }) =>
    locale === 'en' ? `${MONTHS_EN[p.m - 1]} ${p.d}` : locale === 'ko' ? `${p.m}월 ${p.d}일` : `${p.m}月${p.d}日`;
  if (s && e && (s.m !== e.m || s.d !== e.d)) {
    if (s.m === e.m) {
      return locale === 'en'
        ? `${MONTHS_EN[s.m - 1]} ${s.d}–${e.d}`
        : locale === 'ko'
          ? `${s.m}월 ${s.d}–${e.d}일`
          : `${s.m}月${s.d}–${e.d}日`;
    }
    return `${day(s)} – ${day(e)}`;
  }
  return day(one);
}

/**
 * 연결코드(anonId)로 다가오는 여행 1건 조회. 키 미설정·오프라인·오류 시 null(graceful).
 */
export async function fetchUpcomingTrip(anonId: string): Promise<UpcomingTrip | null> {
  if (!SUPABASE_URL || !ANON_KEY || !anonId) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/fetch-trips`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ anonId }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { trip?: UpcomingTrip | null };
    const trip = data?.trip;
    if (!trip || typeof trip.destCode !== 'string' || !trip.destCode) return null;
    return {
      destCode: trip.destCode,
      startDate: trip.startDate ?? null,
      endDate: trip.endDate ?? null,
      source: trip.source ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
