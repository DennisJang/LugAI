// Supabase Edge Function: nearby-storage
// 좌표 기준 근처 짐 보관소 조회(nearby_storage RPC). trip_inbox/feedback처럼 RLS 차단 →
// service_role로 읽어 반환. 본문: { lat, lng, radiusKm?, limit? }
// 배포: supabase functions deploy nearby-storage --no-verify-jwt

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const RATE_MAX = 120;
const RATE_WINDOW = 60;

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
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
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return json({ error: 'lat_lng_required' }, 400);
    }
    const radiusKm = Number.isFinite(Number(body?.radiusKm)) ? Math.min(Math.max(Number(body.radiusKm), 0.2), 20) : 3;
    const limit = Number.isFinite(Number(body?.limit)) ? Math.min(Math.max(Number(body.limit), 1), 100) : 60;

    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nearby_storage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({ p_lat: lat, p_lng: lng, p_radius_km: radiusKm, p_limit: limit }),
    });
    if (!r.ok) {
      console.error('nearby_storage rpc failed', r.status);
      return json({ spots: [] });
    }
    const spots = await r.json();
    return json({ spots: Array.isArray(spots) ? spots : [] });
  } catch (e) {
    console.error('nearby-storage error', String(e).slice(0, 300));
    return json({ spots: [] });
  }
});
