// Supabase Edge Function: embed-corpus  (1회성 admin)
// reg_rules / country_rules 중 embedding IS NULL 인 행을 Supabase 내장 gte-small(384d)로 임베딩.
// 멱등 — 다시 호출해도 이미 채워진 행은 건너뜀. 외부 키 불필요(내장 모델).
// 배포: supabase functions deploy embed-corpus --no-verify-jwt
// 호출(1회): curl -X POST "$URL/functions/v1/embed-corpus" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

interface Row {
  id: number;
  body: string;
}

async function backfill(table: string, model: { run: (t: string, o: unknown) => Promise<number[]> }): Promise<number> {
  const headers = {
    apikey: SERVICE_ROLE!,
    Authorization: `Bearer ${SERVICE_ROLE!}`,
    'content-type': 'application/json',
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id,body&embedding=is.null`, { headers });
  if (!res.ok) throw new Error(`${table} select ${res.status}`);
  const rows = (await res.json()) as Row[];

  let done = 0;
  for (const row of rows) {
    const emb = await model.run(row.body, { mean_pool: true, normalize: true });
    const patch = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ embedding: `[${emb.join(',')}]` }),
    });
    if (patch.ok) done += 1;
  }
  return done;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: 'service_role_not_configured' }, 500);

  try {
    // @ts-ignore — Supabase Edge runtime 전역(내장 임베딩 모델)
    const model = new Supabase.ai.Session('gte-small');
    const reg = await backfill('reg_rules', model);
    const country = await backfill('country_rules', model);
    return json({ embedded: { reg_rules: reg, country_rules: country } });
  } catch (e) {
    return json({ error: 'embed_failed', detail: String(e).slice(0, 300) }, 500);
  }
});
