// Supabase Edge Function: ingest-trip  (여행 자동 연동 웹훅)
// 외부 자동화(Zapier/IFTTT/Make/Apple 단축어 등)가 예매 메일에서 파싱한 여행을 보내면 적재.
// LugAI는 Trip.com/아고다와 직접 제휴 API가 없으므로, 사용자의 자동화가 이 엔드포인트로 POST한다.
// 본문: { connectCode, destCode, startDate?, endDate?, source? }
// 보호: IP 레이트리밋(judge-luggage와 동일 RPC, 미적용 시 graceful skip).
// 배포: supabase functions deploy ingest-trip --no-verify-jwt

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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

/** 실제로 유효한 'YYYY-MM-DD'만 허용(형식 + 달력 검증). 그 외 null. */
function isoDate(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : s;
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
    const connectCode = str(body?.connectCode, 64);
    const destCodeRaw = str(body?.destCode, 8);
    const destCode = destCodeRaw ? destCodeRaw.toUpperCase() : null;
    if (!connectCode || !destCode) return json({ error: 'connect_and_dest_required' }, 400);

    let startDate = isoDate(body?.startDate);
    let endDate = isoDate(body?.endDate);
    // 시작일이 종료일보다 뒤면 날짜를 신뢰할 수 없으니 버리고 도착지만 적재(도착지가 핵심).
    if (startDate && endDate && startDate > endDate) {
      startDate = null;
      endDate = null;
    }

    const row = {
      anon_id: connectCode,
      dest_code: destCode,
      start_date: startDate,
      end_date: endDate,
      source: str(body?.source, 40),
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/trip_inbox`, {
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
      console.error('trip_inbox insert failed', r.status, (await r.text()).slice(0, 300));
      return json({ error: 'insert_failed' }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error('ingest-trip error', String(e).slice(0, 300));
    return json({ error: 'internal' }, 500);
  }
});
