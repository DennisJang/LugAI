// Supabase Edge Function: submit-feedback  (P4 데이터 플라이휠)
// 사용자의 항목별 정정/확인을 익명으로 받아 feedback 테이블에 1행 삽입.
// 사용자가 명시적으로 누른 행동만 수신(동의 기반). PII·이미지 미수신.
// 보호: IP 레이트리밋(judge-luggage와 동일 RPC, 미적용 시 graceful skip) + 필수값 검증.
// 배포: supabase functions deploy submit-feedback --no-verify-jwt

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const VALID_VERDICTS = ['success', 'warning', 'danger', 'info'];
const RATE_MAX = 60; // IP당
const RATE_WINDOW = 60; // 초

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
}

/** RPC 기반 레이트리밋. 테이블/함수 미적용·오류 시 true(허용)로 graceful 처리. */
async function rateLimitOk(ip: string): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return true;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_rate_limit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({ p_ip: ip, p_max: RATE_MAX, p_window_seconds: RATE_WINDOW }),
    });
    if (!r.ok) return true;
    return (await r.json()) !== false;
  } catch {
    return true;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: 'service_role_not_configured' }, 500);

  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (!(await rateLimitOk(ip))) return json({ error: 'rate_limited' }, 429);

    const body = await req.json().catch(() => null);
    const userVerdict = VALID_VERDICTS.includes(body?.userVerdict) ? body.userVerdict : null;
    const destCode = str(body?.destCode, 8);
    const itemKey = str(body?.itemKey, 120);
    // 플라이휠은 도착지·물품 맥락이 없으면 무의미 → 필수
    if (!userVerdict) return json({ error: 'invalid_user_verdict' }, 400);
    if (!destCode || !itemKey) return json({ error: 'dest_and_item_required' }, 400);

    const row = {
      anon_id: str(body?.anonId, 64),
      dest_code: destCode,
      item_key: itemKey,
      ai_verdict: VALID_VERDICTS.includes(body?.aiVerdict) ? body.aiVerdict : null,
      user_verdict: userVerdict,
      note: str(body?.note, 500),
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      console.error('feedback insert failed', r.status, (await r.text()).slice(0, 300));
      return json({ error: 'insert_failed' }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error('submit-feedback error', String(e).slice(0, 300));
    return json({ error: 'internal' }, 500);
  }
});
