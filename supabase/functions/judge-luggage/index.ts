// Supabase Edge Function: judge-luggage
// 사진(base64) + 목적지 + 언어를 받아 Claude vision으로 항공 수하물 판정을 구조화해 반환.
// 시크릿: ANTHROPIC_API_KEY (Supabase Edge Function secret). 앱/깃에는 절대 포함하지 않음.

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const MODEL = 'claude-sonnet-4-6';

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TOOL = {
  name: 'report_items',
  description: 'Per-item air-travel verdicts for items visible in the photo',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            emoji: { type: 'string', description: 'A single emoji representing the item' },
            name: { type: 'string', description: 'Item name (may include size/quantity)' },
            verdict: { type: 'string', enum: ['success', 'warning', 'danger', 'info'] },
            badge: { type: 'string', description: 'Short label (e.g., Carry-on OK, Cabin only, Checked only, Over 100ml, Prohibited)' },
            reason: { type: 'string', description: 'One-line reason' },
            detail: { type: 'string', description: 'Detailed explanation (2-3 sentences)' },
            caseNote: { type: 'string', description: 'Related case / tip (optional)' },
            source: { type: 'string', description: 'Basis/source (e.g., TSA 3-1-1, IATA, destination customs)' },
          },
          required: ['emoji', 'name', 'verdict', 'badge', 'reason', 'detail', 'source'],
        },
      },
    },
    required: ['items'],
  },
};

function buildPrompt(dest: { code: string; name: string }, locale: string, grounding: string): string {
  const lang = locale === 'en' ? 'English' : 'Korean (한국어)';
  const ground = grounding
    ? `\n\nUse these verified baseline rules as ground truth. Prefer them over your own assumptions and cite the source in the "source" field where relevant:\n${grounding}\n`
    : '';
  return `You are an air-travel baggage regulation expert. Identify the carry items visible in the photo and judge each one for travel to "${dest.name} (${dest.code})".${ground}

Consider:
- Carry-on vs checked baggage vs prohibited
- Liquids 100ml rule (cabin), lithium/power banks (cabin only), blades (checked only), lighters (1 in cabin), e-cigarettes (cabin only)
- Destination customs/quarantine (especially food/agricultural rules specific to ${dest.name})

verdict meaning: success = freely allowed (carry-on OK); warning = conditional (cabin only / checked only / quantity·volume limits / quarantine check); danger = prohibited or high seizure risk; info = declare recommended / needs further check.

Rules:
- Write ALL text fields in ${lang}.
- Only items reasonably identifiable in the photo, max 12.
- If uncertain, be conservative (warning/info) and recommend confirming.
- Respond ONLY via the report_items tool.`;
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    if (!ANTHROPIC_API_KEY) return json({ error: 'anthropic_key_not_configured' }, 500);

    const body = await req.json().catch(() => null);
    const image = body?.image;
    const mimeType = typeof body?.mimeType === 'string' ? body.mimeType : 'image/jpeg';
    const locale = body?.locale === 'en' ? 'en' : 'ko';
    const destination = body?.destination ?? { code: 'XX', name: 'destination' };
    if (!image || typeof image !== 'string') return json({ error: 'image_base64_required' }, 400);

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'report_items' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
              { type: 'text', text: buildPrompt(destination, locale) },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const detail = (await aiRes.text()).slice(0, 500);
      return json({ error: 'anthropic_error', status: aiRes.status, detail }, 502);
    }

    const data = await aiRes.json();
    const toolUse = (data?.content ?? []).find((c: { type?: string }) => c.type === 'tool_use');
    const items = toolUse?.input?.items ?? [];
    return json({ items });
  } catch (e) {
    return json({ error: 'internal', detail: String(e).slice(0, 300) }, 500);
  }
});
