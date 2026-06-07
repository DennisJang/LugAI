// Supabase Edge Function: judge-luggage
// 사진(base64) + 목적지 + 언어 + 그라운딩을 받아 Claude vision으로 항공 수하물 판정을 반환.
// 보호: 이미지 크기 제한 + IP 레이트리밋(RPC check_rate_limit, 미적용 시 graceful skip).
// 시크릿: ANTHROPIC_API_KEY (Edge Function secret). SUPABASE_URL/SERVICE_ROLE_KEY는 플랫폼 자동 주입.

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const MODEL = 'claude-sonnet-4-6';
const MAX_IMAGE_CHARS = 8_000_000; // base64 길이 상한(~6MB)
const RATE_MAX = 30; // IP당
const RATE_WINDOW = 3600; // 초(1시간)

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
            category: {
              type: 'string',
              enum: ['liquids', 'powerbank', 'blade', 'lighter', 'vape', 'powder', 'food', 'flammable', 'general'],
              description: 'Language-independent category of the item (for clustering/learning)',
            },
            verdict: { type: 'string', enum: ['success', 'warning', 'danger', 'info'] },
            badge: { type: 'string', description: 'Short label (e.g., Carry-on OK, Cabin only, Checked only, Over 100ml, Prohibited)' },
            reason: { type: 'string', description: 'One-line reason' },
            detail: { type: 'string', description: 'Detailed explanation (2-3 sentences)' },
            caseNote: { type: 'string', description: 'Related case / tip (optional)' },
            source: { type: 'string', description: 'Basis/source (e.g., TSA 3-1-1, IATA, destination customs)' },
            confidence: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description:
                "Your honest confidence in THIS item's identification AND verdict. Use 'low' when the item is blurry, partially hidden, too small to read, or its capacity/volume label is unreadable; 'medium' when identified but a decisive number is uncertain; 'high' when clearly legible.",
            },
            measurement: {
              type: 'string',
              description:
                "The capacity or volume you actually READ off the label, with unit (e.g. '20000mAh', '99Wh', '120ml'). Omit if no number is legible. Do NOT guess.",
            },
          },
          required: ['emoji', 'name', 'verdict', 'badge', 'reason', 'detail', 'source'],
        },
      },
    },
    required: ['items'],
  },
};

function buildPrompt(dest: { code: string; name: string }, locale: string, grounding: string): string {
  const lang =
    locale === 'en'
      ? 'English'
      : locale === 'ja'
        ? 'Japanese (日本語)'
        : locale === 'zh'
          ? 'Simplified Chinese (简体中文)'
          : 'Korean (한국어)';
  const ground = grounding
    ? `\n\nUse these verified baseline rules as ground truth. Prefer them over your own assumptions and cite the source in the "source" field where relevant:\n${grounding}\n`
    : '';
  return `You are an air-travel baggage regulation expert. Identify the carry items visible in the photo and judge each one for travel to "${dest.name} (${dest.code})".${ground}

Consider:
- Carry-on vs checked baggage vs prohibited
- Liquids 100ml rule (cabin), lithium/power banks (cabin only), blades (checked only), lighters (1 in cabin), e-cigarettes (cabin only)
- Destination customs/quarantine (especially food/agricultural rules specific to ${dest.name})

Read the labels (OCR matters most here):
- Look for printed numbers on each item and READ them: battery capacity in Wh or mAh, liquid/gel volume in ml.
- When you can read a number, put it in the "measurement" field (e.g. "20000mAh", "120ml") and reflect it in "name" and "reason".
- Reason about that number against the rules: power banks ≤100Wh (~27,000mAh) are cabin-allowed; liquids must be ≤100ml per container.
- You cannot zoom or crop. If the text is too small, blurry, or cut off to read with confidence, do NOT guess the number — say so and lower that item's confidence.

Confidence (be honest):
- Set "confidence" per item: "low" when the item is blurry, partially hidden, too small, or its capacity/volume label is unreadable; "medium" when identified but a decisive number is uncertain; "high" when clearly legible.
- Do NOT change a verdict just because confidence is low — give your best verdict and report the low confidence honestly. Low-confidence items get flagged for a closer re-photo on the client side.

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
    const ok = await r.json();
    return ok !== false;
  } catch {
    return true;
  }
}

/**
 * DB 규정 코퍼스(reg_rules + country_rules)에서 동적 grounding 생성.
 * 코퍼스를 DB로 이전해 앱 재배포 없이 규칙을 수정·확장(데이터 플라이휠)할 수 있게 한다.
 * 테이블 미적용·임베딩 미백필·오류 시 앱이 보낸 정적 grounding(regulations.ts)으로 graceful 폴백.
 * 참고: 벡터 RPC `match_regulations`는 코퍼스 확장 후 per-item 시맨틱 검색용으로 예약 — 아직 미연동.
 *       현재는 (도착지) 구조화 조회. 동적 경로가 정적보다 부실해지지 않도록 country 행이 없으면 정적 폴백.
 */
async function fetchGrounding(destCode: string, fallback: string): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return fallback;
  try {
    const headers = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };
    const [baseRes, ctryRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/reg_rules?select=body,badge,source&locale=eq.en`, { headers }),
      fetch(
        `${SUPABASE_URL}/rest/v1/country_rules?select=body,source&code=eq.${encodeURIComponent(destCode)}`,
        { headers },
      ),
    ]);
    if (!baseRes.ok) return fallback;
    const base = (await baseRes.json()) as Array<{ body: string; badge: string; source: string }>;
    if (!Array.isArray(base) || !base.length) return fallback;
    const ctry = ctryRes.ok ? ((await ctryRes.json()) as Array<{ body: string; source: string }>) : [];
    // 도착지 특이규정이 DB에 없으면 앱이 보낸 정적 grounding(국가 노트 포함)이 더 완전 → 폴백
    if (!ctry.length && fallback) return fallback;
    const baseText = base.map((r) => `- ${r.body} [${r.badge}] (src: ${r.source})`).join('\n');
    const ctryText =
      Array.isArray(ctry) && ctry.length
        ? `\n\nDESTINATION-SPECIFIC (${destCode}):\n` + ctry.map((r) => `- ${r.body} (src: ${r.source})`).join('\n')
        : '';
    return `GENERAL BASELINE:\n${baseText}${ctryText}`;
  } catch {
    return fallback;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    if (!ANTHROPIC_API_KEY) return json({ error: 'anthropic_key_not_configured' }, 500);

    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (!(await rateLimitOk(ip))) return json({ error: 'rate_limited' }, 429);

    const body = await req.json().catch(() => null);
    const image = body?.image;
    const mimeType = typeof body?.mimeType === 'string' ? body.mimeType : 'image/jpeg';
    const locale = ['en', 'ja', 'zh'].includes(body?.locale) ? body.locale : 'ko';
    const staticGrounding = typeof body?.grounding === 'string' ? body.grounding.slice(0, 4000) : '';
    const destination = body?.destination ?? { code: 'XX', name: 'destination' };
    if (!image || typeof image !== 'string') return json({ error: 'image_base64_required' }, 400);
    if (image.length > MAX_IMAGE_CHARS) return json({ error: 'image_too_large' }, 413);

    // 동적 grounding(DB 코퍼스) → 미가용 시 정적 폴백
    const grounding = await fetchGrounding(destination.code, staticGrounding);

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
              { type: 'text', text: buildPrompt(destination, locale, grounding) },
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
