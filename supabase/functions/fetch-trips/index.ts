// Supabase Edge Function: fetch-trips
// 앱이 연결코드(anonId)로 다가오는 여행 1건을 조회. trip_inbox는 RLS로 직접 접근 불가라
// service_role로 읽어 반환한다. 본문: { anonId }
// 배포: supabase functions deploy fetch-trips --no-verify-jwt

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const RATE_MAX = 120; // IP당 (앱 실행 시 1회 호출 → 넉넉히)
const RATE_WINDOW = 60;

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

/** 연결코드 enumeration 방지용 레이트리밋. 미적용 시 graceful skip. */
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
    const anonId = typeof body?.anonId === 'string' ? body.anonId.trim().slice(0, 64) : '';
    if (!anonId) return json({ error: 'anon_id_required' }, 400);

    const today = new Date().toISOString().slice(0, 10);
    // 다가오는 여행: end_date가 미래거나, 시작일이 미래거나, 일자 미지정 → 과거 여행 제외. 최근 적재 1건.
    const q =
      `${SUPABASE_URL}/rest/v1/trip_inbox` +
      `?anon_id=eq.${encodeURIComponent(anonId)}` +
      `&or=(end_date.gte.${today},start_date.gte.${today},and(start_date.is.null,end_date.is.null))` +
      `&select=dest_code,start_date,end_date,source` +
      `&order=created_at.desc&limit=1`;
    const r = await fetch(q, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    if (!r.ok) {
      console.error('trip_inbox query failed', r.status);
      return json({ trip: null });
    }
    const rows = (await r.json()) as Array<{ dest_code: string; start_date: string | null; end_date: string | null; source: string | null }>;
    const row = Array.isArray(rows) && rows.length ? rows[0] : null;
    const trip = row
      ? { destCode: row.dest_code, startDate: row.start_date, endDate: row.end_date, source: row.source }
      : null;
    return json({ trip });
  } catch (e) {
    console.error('fetch-trips error', String(e).slice(0, 300));
    return json({ trip: null });
  }
});
