import type { VerdictKey } from '@/design';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TIMEOUT_MS = 10000;

export interface FeedbackParams {
  /** 익명 ID (PII 아님) */
  anonId: string;
  destCode: string;
  /** 언어 독립 물품 식별자(카테고리 키, 없으면 물품명 폴백) — 플라이휠 클러스터링용 */
  itemKey: string;
  /** AI/현 판정 */
  aiVerdict: VerdictKey;
  /** 사용자가 보고한 실제 판정 */
  userVerdict: VerdictKey;
  note?: string;
}

/**
 * 사용자 정정/확인을 submit-feedback Edge Function으로 전송(데이터 플라이휠).
 * 사용자가 명시적으로 누른 행동만 호출. 키 미설정·네트워크·서버 오류 시 조용히 실패(false) —
 * 피드백 실패가 사용자 경험을 막지 않는다.
 */
export async function submitFeedback(params: FeedbackParams): Promise<boolean> {
  if (!SUPABASE_URL || !ANON_KEY) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-feedback`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
