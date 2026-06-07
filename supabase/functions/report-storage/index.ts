// Supabase Edge Function: report-storage  (보관소 신선도 플라이휠)
// 사용자가 보관소 폐업/이전/오류를 제보 → storage_reports 1행. 명시 행동만, 익명.
// 본문: { anonId, spotId, issue, note? }   issue ∈ closed|moved|wrong_price|wrong_hours|other
// 배포: supabase functions deploy report-storage --no-verify-jwt

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const VALID_ISSUES = ['closed', 'moved', 'wrong_price', 'wrong_hours', 'other'];
const RATE_MAX = 60;
const RATE_WINDOW = 60;

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
    const issue = VALID_ISSUES.includes(body?.issue) ? body.issue : null;
    const spotId = Number(body?.spotId);
    if (!issue) return json({ error: 'invalid_issue' }, 400);
    if (!Number.isInteger(spotId) || spotId <= 0) return json({ error: 'spot_id_required' }, 400);

    const row = {
      spot_id: spotId,
      anon_id: str(body?.anonId, 64),
      issue,
      note: str(body?.note, 300),
    };
    const r = await fetch(`${SUPABASE_URL}/rest/v1/storage_reports`, {
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
      console.error('storage_reports insert failed', r.status);
      return json({ error: 'insert_failed' }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error('report-storage error', String(e).slice(0, 300));
    return json({ error: 'internal' }, 500);
  }
});
