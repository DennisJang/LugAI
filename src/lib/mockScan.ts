import type { VerdictKey } from '@/design';

import type { Country } from './countries';
import { pick, type Locale } from './i18n';

export interface ScanItem {
  id: string;
  emoji: string;
  name: string;
  verdict: VerdictKey;
  badge: string;
  reason: string;
  detail: string;
  caseNote?: string;
  source: string;
}

export interface ScanResult {
  destination: Country;
  items: ScanItem[];
  scannedAt: string;
}

type L = { ko: string; en: string };
interface BaseItem {
  emoji: string;
  verdict: VerdictKey;
  name: L;
  badge: L;
  reason: L;
  detail: L;
  caseNote?: L;
  source: L;
}

const BASE: BaseItem[] = [
  {
    emoji: '🔋',
    verdict: 'warning',
    name: { ko: '보조배터리 20,000mAh', en: '20,000mAh power bank' },
    badge: { ko: '기내만', en: 'Cabin only' },
    reason: {
      ko: '리튬 배터리는 위탁 금지 — 기내에만 반입 가능',
      en: 'Lithium batteries are banned from checked bags — carry-on only',
    },
    detail: {
      ko: '100Wh(약 27,000mAh) 이하는 기내 반입 가능. 20,000mAh는 허용 범위지만 항공사별로 보통 2개까지만 허용돼요.',
      en: 'Under 100Wh (~27,000mAh) is allowed in the cabin. 20,000mAh is fine, but most airlines allow up to 2.',
    },
    caseNote: { ko: '게이트에서 3개째는 회수되는 경우가 많아요.', en: 'A third one is often confiscated at the gate.' },
    source: { ko: 'IATA / 항공사 공통', en: 'IATA / airlines' },
  },
  {
    emoji: '🧴',
    verdict: 'danger',
    name: { ko: '토너 120ml', en: '120ml toner' },
    badge: { ko: '100ml 초과', en: 'Over 100ml' },
    reason: { ko: '기내 액체는 용기당 100ml 이하만 허용', en: 'Cabin liquids must be 100ml or less per container' },
    detail: {
      ko: '내용물이 적어도 용기 표기 용량이 기준이라 120ml 용기는 기내 반입 불가. 위탁 수하물로 부치세요.',
      en: "The container size counts, not how much is left — a 120ml bottle can't go in the cabin. Pack it in checked baggage.",
    },
    caseNote: {
      ko: '환승 시 면세 액체도 100ml 룰에 걸려 압수되곤 해요.',
      en: 'Even duty-free liquids can be seized at a transfer under the 100ml rule.',
    },
    source: { ko: 'TSA 3-1-1 / ICAO', en: 'TSA 3-1-1 / ICAO' },
  },
  {
    emoji: '🔪',
    verdict: 'warning',
    name: { ko: '맥가이버칼', en: 'Swiss army knife' },
    badge: { ko: '위탁만', en: 'Checked only' },
    reason: { ko: '날붙이는 기내 반입 불가 — 위탁 수하물로만', en: 'Blades are banned from the cabin — checked baggage only' },
    detail: {
      ko: '날 길이와 무관하게 칼류는 기내 금지. 위탁 수하물에 넣으면 문제없어요.',
      en: "Knives are banned in the cabin regardless of blade length. They're fine in checked baggage.",
    },
    source: { ko: '국토부 항공보안 / TSA', en: 'Aviation security / TSA' },
  },
  {
    emoji: '💨',
    verdict: 'warning',
    name: { ko: '전자담배', en: 'E-cigarette' },
    badge: { ko: '기내만', en: 'Cabin only' },
    reason: {
      ko: '전자담배·예비 배터리는 위탁 금지 — 기내 휴대만',
      en: 'Vapes and spare batteries are banned from checked bags — carry-on only',
    },
    detail: {
      ko: '기내 휴대는 가능하나 기내에서 사용·충전은 금지. 위탁 수하물엔 넣을 수 없어요.',
      en: 'Allowed in the cabin, but using or charging it onboard is prohibited. Cannot go in checked baggage.',
    },
    source: { ko: 'IATA', en: 'IATA' },
  },
  {
    emoji: '☀️',
    verdict: 'success',
    name: { ko: '선크림 50ml', en: '50ml sunscreen' },
    badge: { ko: '기내 OK', en: 'Carry-on OK' },
    reason: { ko: '100ml 이하 액체 — 기내 반입 가능', en: 'Liquid 100ml or less — allowed in the cabin' },
    detail: { ko: '투명 지퍼백(1L)에 담으면 기내 반입 OK.', en: 'Fine in the cabin inside a clear 1L zip bag.' },
    source: { ko: 'TSA 3-1-1', en: 'TSA 3-1-1' },
  },
  {
    emoji: '✂️',
    verdict: 'success',
    name: { ko: '손톱깎이', en: 'Nail clippers' },
    badge: { ko: '기내 OK', en: 'Carry-on OK' },
    reason: { ko: '소형 손톱깎이는 기내 허용', en: 'Small nail clippers are allowed in the cabin' },
    detail: {
      ko: '날이 짧은 손톱깎이는 대부분 기내 반입 가능해요.',
      en: 'Clippers with short blades are generally allowed in the cabin.',
    },
    source: { ko: 'TSA', en: 'TSA' },
  },
  {
    emoji: '🥬',
    verdict: 'warning',
    name: { ko: '포장 김치', en: 'Packaged kimchi' },
    badge: { ko: '검역 확인', en: 'Check quarantine' },
    reason: {
      ko: '액체류로 간주될 수 있고, 도착지 검역 대상',
      en: 'May count as a liquid and is subject to destination quarantine',
    },
    detail: {
      ko: '국물 있는 김치는 100ml 룰 적용. 도착지에 따라 반입 신고가 필요해요.',
      en: 'Kimchi with liquid falls under the 100ml rule. Declaration may be required depending on the destination.',
    },
    caseNote: {
      ko: '호주·뉴질랜드는 미신고 식품에 큰 벌금이 있어요.',
      en: 'Australia and New Zealand fine undeclared food heavily.',
    },
    source: { ko: '도착지 세관·검역', en: 'Destination customs / quarantine' },
  },
  {
    emoji: '🔥',
    verdict: 'danger',
    name: { ko: '라이터', en: 'Lighter' },
    badge: { ko: '기내 1개만', en: '1 in cabin' },
    reason: {
      ko: '라이터는 위탁 금지, 기내도 1개만 휴대 가능',
      en: 'Lighters are banned from checked bags; only 1 may be carried on your person',
    },
    detail: {
      ko: '위탁 수하물엔 넣을 수 없어요. 기내 휴대는 1인 1개로 제한돼요.',
      en: 'Cannot go in checked baggage. Limited to one per person carried on.',
    },
    source: { ko: '국토부 / FAA', en: 'Aviation authority / FAA' },
  },
];

/** 도착지·언어 기반 mock 분석 결과 (P2에서 Claude vision 결과로 대체). */
export function mockScanFor(destination: Country, scannedAt: string, locale: Locale = 'ko'): ScanResult {
  const items: ScanItem[] = BASE.map((b, i) => ({
    id: `item-${i}`,
    emoji: b.emoji,
    verdict: b.verdict,
    name: pick(b.name, locale),
    badge: pick(b.badge, locale),
    reason: pick(b.reason, locale),
    detail: pick(b.detail, locale),
    caseNote: b.caseNote ? pick(b.caseNote, locale) : undefined,
    source: pick(b.source, locale),
  }));

  // 검역 엄격국: 김치 → 금지
  if (['AU', 'NZ'].includes(destination.code)) {
    const kimchi = items.find((it) => it.id === 'item-6');
    if (kimchi) {
      kimchi.verdict = 'danger';
      kimchi.badge = locale === 'ko' ? '반입 금지' : 'Prohibited';
      kimchi.reason =
        locale === 'ko'
          ? '검역 매우 엄격 — 미신고 식품 반입 금지'
          : 'Very strict quarantine — undeclared food is prohibited';
      kimchi.caseNote =
        locale === 'ko' ? '실제 $300+ 벌금 사례가 많아요.' : 'Real cases of $300+ fines are common.';
    }
  }

  return { destination, items, scannedAt };
}

export const VERDICT_ORDER: VerdictKey[] = ['danger', 'warning', 'success', 'info'];

export function groupByVerdict(items: ScanItem[]): Record<VerdictKey, ScanItem[]> {
  return {
    danger: items.filter((i) => i.verdict === 'danger'),
    warning: items.filter((i) => i.verdict === 'warning'),
    success: items.filter((i) => i.verdict === 'success'),
    info: items.filter((i) => i.verdict === 'info'),
  };
}
