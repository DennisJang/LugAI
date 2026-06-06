// Supabase Edge Function: judge-luggage
// 사진(base64) + 목적지를 받아 Claude vision으로 항공 수하물 판정을 구조화해 반환.
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
  description: '사진 속 짐 물품별 항공 반입 판정 결과',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            emoji: { type: 'string', description: '물품을 나타내는 이모지 1개' },
            name: { type: 'string', description: '물품 이름(한국어, 용량/수량 포함 가능)' },
            verdict: { type: 'string', enum: ['success', 'warning', 'danger', 'info'] },
            badge: { type: 'string', description: '짧은 라벨(예: 기내 OK, 기내만, 위탁만, 100ml 초과, 반입 금지)' },
            reason: { type: 'string', description: '한 줄 사유(한국어)' },
            detail: { type: 'string', description: '상세 설명(한국어, 2~3문장)' },
            caseNote: { type: 'string', description: '관련 사례/주의 팁(한국어, 선택)' },
            source: { type: 'string', description: '근거 출처(예: TSA 3-1-1, IATA, 도착지 세관)' },
          },
          required: ['emoji', 'name', 'verdict', 'badge', 'reason', 'detail', 'source'],
        },
      },
    },
    required: ['items'],
  },
};

function buildPrompt(dest: { code: string; name: string }): string {
  return `너는 항공 수하물 규정 전문가야. 사진에 보이는 휴대 물품들을 식별하고, 각 물품을 "${dest.name}(${dest.code})" 여행 기준으로 판정해줘.

판정 시 고려:
- 기내 휴대 vs 위탁 수하물 vs 반입 금지
- 액체 100ml 룰(기내), 리튬/보조배터리(기내만), 날붙이(위탁만), 라이터(기내 1개), 전자담배(기내만)
- 도착지 세관/검역(특히 식품·농산물 등 ${dest.name} 특유 규정)

verdict 의미: success=자유 반입(기내 OK), warning=조건부(기내만/위탁만/용량·수량 제한/검역 확인), danger=반입 금지 또는 압수 위험, info=신고 권장/추가 확인 필요.

규칙:
- 모든 텍스트는 한국어.
- 사진에서 합리적으로 식별되는 물품만, 최대 12개.
- 불확실하면 보수적으로 warning/info로 두고 확인을 권장.
- 반드시 report_items 도구로만 답해.`;
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    if (!ANTHROPIC_API_KEY) return json({ error: 'anthropic_key_not_configured' }, 500);

    const body = await req.json().catch(() => null);
    const image = body?.image;
    const mimeType = typeof body?.mimeType === 'string' ? body.mimeType : 'image/jpeg';
    const destination = body?.destination ?? { code: 'XX', name: '도착지' };
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
              { type: 'text', text: buildPrompt(destination) },
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
