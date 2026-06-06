import type { VerdictKey } from '@/design';

import type { Localized } from './i18n';

export interface RegRule {
  id: string;
  emoji: string;
  title: Localized;
  verdict: VerdictKey;
  badge: Localized;
  detail: Localized;
  source: string;
}

/** 전 세계 공통(일반) 항공 수하물 기준 — 참고용, 출처 표기. */
export const BASELINE: RegRule[] = [
  {
    id: 'liquids',
    emoji: '🧴',
    title: { ko: '액체·젤·에어로졸', en: 'Liquids, gels, aerosols' },
    verdict: 'warning',
    badge: { ko: '100ml 이하', en: '≤100ml' },
    detail: {
      ko: '기내는 용기당 100ml 이하만, 1L 투명 지퍼백에 담아야 해요. 초과분은 위탁 수하물로.',
      en: 'Cabin: 100ml or less per container in a 1L clear bag. Anything larger goes in checked baggage.',
    },
    source: 'ICAO / TSA 3-1-1 / EU',
  },
  {
    id: 'powerbank',
    emoji: '🔋',
    title: { ko: '보조배터리·리튬 배터리', en: 'Power banks / lithium batteries' },
    verdict: 'warning',
    badge: { ko: '기내만', en: 'Cabin only' },
    detail: {
      ko: '위탁 금지, 기내 휴대만. 100Wh 이하는 OK, 100–160Wh는 항공사 승인이 필요해요.',
      en: 'Banned from checked bags — cabin only. Up to 100Wh is fine; 100–160Wh needs airline approval.',
    },
    source: 'IATA',
  },
  {
    id: 'blade',
    emoji: '🔪',
    title: { ko: '칼·날붙이', en: 'Knives & blades' },
    verdict: 'warning',
    badge: { ko: '위탁만', en: 'Checked only' },
    detail: {
      ko: '기내 반입 불가, 위탁 수하물로만 가능해요.',
      en: 'Not allowed in the cabin; checked baggage only.',
    },
    source: 'ICAO / TSA',
  },
  {
    id: 'lighter',
    emoji: '🔥',
    title: { ko: '라이터', en: 'Lighter' },
    verdict: 'danger',
    badge: { ko: '기내 1개', en: '1 in cabin' },
    detail: {
      ko: '위탁 수하물 금지. 1인당 1개만 휴대할 수 있어요.',
      en: 'Banned from checked bags. Only one per person may be carried on.',
    },
    source: 'ICAO / FAA',
  },
  {
    id: 'vape',
    emoji: '💨',
    title: { ko: '전자담배', en: 'E-cigarettes / vapes' },
    verdict: 'warning',
    badge: { ko: '기내만', en: 'Cabin only' },
    detail: {
      ko: '위탁 금지, 기내 휴대만. 기내에서 사용·충전은 금지예요. (일부 국가는 반입 자체 금지)',
      en: 'Banned from checked bags, cabin only. No use/charging onboard. (Some countries ban them entirely.)',
    },
    source: 'IATA',
  },
  {
    id: 'powder',
    emoji: '🧂',
    title: { ko: '분말류', en: 'Powders' },
    verdict: 'info',
    badge: { ko: '추가 검색', en: 'Extra screening' },
    detail: {
      ko: '350g/350ml를 넘는 분말은 추가 보안검색 대상이 될 수 있어요.',
      en: 'Powders over 350g/350ml may be subject to extra security screening.',
    },
    source: 'TSA',
  },
  {
    id: 'food',
    emoji: '🥫',
    title: { ko: '식품·농산물', en: 'Food & produce' },
    verdict: 'info',
    badge: { ko: '세관 신고', en: 'Declare' },
    detail: {
      ko: '도착지 검역·세관 대상이에요. 육류·과일·종자 등은 제한되거나 신고가 필요해요.',
      en: 'Subject to destination quarantine/customs. Meat, fruit, and seeds are often restricted — declare them.',
    },
    source: '도착지 세관·검역',
  },
  {
    id: 'flammable',
    emoji: '🧯',
    title: { ko: '인화성·압축가스', en: 'Flammable / compressed gas' },
    verdict: 'danger',
    badge: { ko: '반입 금지', en: 'Prohibited' },
    detail: {
      ko: '부탄가스·인화성 스프레이 등은 기내·위탁 모두 금지예요.',
      en: 'Butane, flammable sprays, etc. are banned in both cabin and checked baggage.',
    },
    source: 'IATA DGR',
  },
];

export interface CountryNote {
  title: Localized;
  body: Localized;
  verdict: VerdictKey;
  source: string;
}

/** 국가별 특이사항 — 주요 목적지, 참고용. */
export const COUNTRY_NOTES: Record<string, CountryNote[]> = {
  JP: [
    {
      title: { ko: '육류 반입 제한', en: 'Meat import restrictions' },
      body: {
        ko: '햄·소시지 등 육류 가공품 반입이 엄격히 제한돼요(가축전염병 검역).',
        en: 'Meat products like ham and sausage are strictly restricted (animal quarantine).',
      },
      verdict: 'danger',
      source: '일본 동물검역소',
    },
    {
      title: { ko: '면세 액체 환승', en: 'Duty-free liquids on transfer' },
      body: {
        ko: '환승 시 봉인(STEB) 안 된 면세 액체는 압수될 수 있어요.',
        en: 'On transfer, duty-free liquids not in a sealed STEB bag may be confiscated.',
      },
      verdict: 'warning',
      source: '국토교통성',
    },
  ],
  US: [
    {
      title: { ko: 'TSA 3-1-1', en: 'TSA 3-1-1' },
      body: {
        ko: '액체는 100ml(3.4oz) 이하, 1쿼트 지퍼백 1개까지.',
        en: 'Liquids must be 3.4oz (100ml) or less, in one quart-size bag.',
      },
      verdict: 'warning',
      source: 'TSA',
    },
    {
      title: { ko: '농축산물 신고', en: 'Agricultural declaration' },
      body: {
        ko: '과일·육류·식물은 반입 신고 필수(USDA). 미신고 시 벌금이 있어요.',
        en: 'Fruit, meat, and plants must be declared (USDA). Fines apply for non-declaration.',
      },
      verdict: 'info',
      source: 'USDA / CBP',
    },
  ],
  AU: [
    {
      title: { ko: '매우 엄격한 검역', en: 'Very strict biosecurity' },
      body: {
        ko: '모든 식품·식물·목재·종자를 신고해야 해요. 미신고 시 큰 벌금·압수.',
        en: 'You must declare all food, plants, wood, and seeds. Heavy fines/seizure if undeclared.',
      },
      verdict: 'danger',
      source: '호주 농업부(DAFF)',
    },
  ],
  NZ: [
    {
      title: { ko: '매우 엄격한 검역', en: 'Very strict biosecurity' },
      body: {
        ko: '식품·자연물을 전부 신고해야 해요. 미신고 시 즉시 $400 벌금.',
        en: 'Declare all food and natural items. Instant $400 fine if undeclared.',
      },
      verdict: 'danger',
      source: '뉴질랜드 MPI',
    },
  ],
  EU: [
    {
      title: { ko: '액체 100ml', en: '100ml liquids' },
      body: { ko: 'EU 공통 액체 100ml 규정이 적용돼요.', en: 'The EU-wide 100ml liquid rule applies.' },
      verdict: 'warning',
      source: 'EU',
    },
    {
      title: { ko: '육류·유제품', en: 'Meat & dairy' },
      body: {
        ko: '비EU발 육류·유제품의 개인 반입은 원칙적으로 금지예요.',
        en: 'Personal imports of meat/dairy from outside the EU are generally banned.',
      },
      verdict: 'danger',
      source: 'EU 집행위',
    },
  ],
  FR: [
    {
      title: { ko: '액체·육류 규정', en: 'Liquids & meat rules' },
      body: { ko: 'EU 규정 동일(액체 100ml, 비EU 육류·유제품 제한).', en: 'Same as EU (100ml liquids, non-EU meat/dairy restricted).' },
      verdict: 'warning',
      source: 'EU',
    },
  ],
  CN: [
    {
      title: { ko: '보조배터리 표기', en: 'Power bank marking' },
      body: {
        ko: '용량(Wh/mAh)이 명확히 표기·인증되지 않은 보조배터리는 압수돼요.',
        en: 'Power banks without clear capacity marking/certification are confiscated.',
      },
      verdict: 'warning',
      source: 'CAAC',
    },
  ],
  GB: [
    {
      title: { ko: '액체 100ml', en: '100ml liquids' },
      body: {
        ko: '일부 공항은 신형 스캐너로 완화 중이지만 기본은 100ml예요.',
        en: 'Some airports are relaxing this with new scanners, but 100ml is the default.',
      },
      verdict: 'warning',
      source: 'UK CAA',
    },
  ],
  AE: [
    {
      title: { ko: '의약품 주의', en: 'Medication caution' },
      body: {
        ko: '일부 의약품·양귀비씨 등은 반입이 제한돼요. 처방전 지참을 권장해요.',
        en: 'Some medications and items like poppy seeds are restricted. Carry prescriptions.',
      },
      verdict: 'info',
      source: 'UAE 당국',
    },
  ],
  TH: [
    {
      title: { ko: '전자담배 반입 금지', en: 'E-cigarettes banned' },
      body: {
        ko: '태국은 전자담배 반입·소지 자체가 불법이에요(벌금·구금 위험).',
        en: 'Thailand makes bringing in or possessing e-cigarettes illegal (risk of fines/detention).',
      },
      verdict: 'danger',
      source: '태국 관세청',
    },
  ],
  VN: [
    {
      title: { ko: '면세 주류·담배 한도', en: 'Duty-free limits' },
      body: { ko: '주류·담배가 면세 한도를 넘으면 신고해야 해요.', en: 'Declare alcohol/tobacco that exceeds duty-free limits.' },
      verdict: 'info',
      source: '베트남 관세청',
    },
  ],
};

export function countryNotes(code: string): CountryNote[] {
  return COUNTRY_NOTES[code] ?? [];
}

/** Edge Function 프롬프트 그라운딩용 압축 텍스트(영문 고정 — 모델 입력용). */
export function groundingText(code: string): string {
  const base = BASELINE.map((r) => `- ${r.title.en} [${r.badge.en}]: ${r.detail.en} (src: ${r.source})`).join('\n');
  const notes = countryNotes(code)
    .map((n) => `- ${n.title.en}: ${n.body.en} (src: ${n.source})`)
    .join('\n');
  return `GENERAL BASELINE:\n${base}${notes ? `\n\nDESTINATION-SPECIFIC (${code}):\n${notes}` : ''}`;
}
