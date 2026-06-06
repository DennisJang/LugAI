import type { VerdictKey } from '@/design';

import type { Country } from './countries';

export interface ScanItem {
  id: string;
  emoji: string;
  name: string;
  verdict: VerdictKey;
  /** 짧은 판정 라벨 (예: 기내만, 100ml 초과) */
  badge: string;
  /** 한 줄 사유 */
  reason: string;
  /** 펼침 시 상세 설명 */
  detail: string;
  /** 재밌는/위험했던 사례 TMI (선택) */
  caseNote?: string;
  /** 근거 출처 */
  source: string;
}

export interface ScanResult {
  destination: Country;
  items: ScanItem[];
  scannedAt: string;
}

const BASE: Omit<ScanItem, 'id'>[] = [
  {
    emoji: '🔋',
    name: '보조배터리 20,000mAh',
    verdict: 'warning',
    badge: '기내만',
    reason: '리튬 배터리는 위탁 금지 — 기내에만 반입 가능',
    detail:
      '100Wh(약 27,000mAh) 이하는 기내 반입 가능. 20,000mAh는 허용 범위지만 항공사별로 보통 2개까지만 허용돼요.',
    caseNote: '게이트에서 3개째는 회수되는 경우가 많아요.',
    source: 'IATA / 항공사 공통',
  },
  {
    emoji: '🧴',
    name: '토너 120ml',
    verdict: 'danger',
    badge: '100ml 초과',
    reason: '기내 액체는 용기당 100ml 이하만 허용',
    detail:
      '내용물이 적어도 용기 표기 용량이 기준이라 120ml 용기는 기내 반입 불가. 위탁 수하물로 부치세요.',
    caseNote: '환승 시 면세 액체도 100ml 룰에 걸려 압수되곤 해요.',
    source: 'TSA 3-1-1 / ICAO',
  },
  {
    emoji: '🔪',
    name: '맥가이버칼',
    verdict: 'warning',
    badge: '위탁만',
    reason: '날붙이는 기내 반입 불가 — 위탁 수하물로만',
    detail: '날 길이와 무관하게 칼류는 기내 금지. 위탁 수하물에 넣으면 문제없어요.',
    source: '국토부 항공보안 / TSA',
  },
  {
    emoji: '💨',
    name: '전자담배',
    verdict: 'warning',
    badge: '기내만',
    reason: '전자담배·예비 배터리는 위탁 금지 — 기내 휴대만',
    detail: '기내 휴대는 가능하나 기내에서 사용·충전은 금지. 위탁 수하물엔 넣을 수 없어요.',
    source: 'IATA',
  },
  {
    emoji: '☀️',
    name: '선크림 50ml',
    verdict: 'success',
    badge: '기내 OK',
    reason: '100ml 이하 액체 — 기내 반입 가능',
    detail: '투명 지퍼백(1L)에 담으면 기내 반입 OK.',
    source: 'TSA 3-1-1',
  },
  {
    emoji: '✂️',
    name: '손톱깎이',
    verdict: 'success',
    badge: '기내 OK',
    reason: '소형 손톱깎이는 기내 허용',
    detail: '날이 짧은 손톱깎이는 대부분 기내 반입 가능해요.',
    source: 'TSA',
  },
  {
    emoji: '🥬',
    name: '포장 김치',
    verdict: 'warning',
    badge: '검역 확인',
    reason: '액체류로 간주될 수 있고, 도착지 검역 대상',
    detail: '국물 있는 김치는 100ml 룰 적용. 도착지에 따라 반입 신고가 필요해요.',
    caseNote: '호주·뉴질랜드는 미신고 식품에 큰 벌금이 있어요.',
    source: '도착지 세관·검역',
  },
  {
    emoji: '🔥',
    name: '라이터',
    verdict: 'danger',
    badge: '기내 1개만',
    reason: '라이터는 위탁 금지, 기내도 1개만 휴대 가능',
    detail: '위탁 수하물엔 넣을 수 없어요. 기내 휴대는 1인 1개로 제한돼요.',
    source: '국토부 / FAA',
  },
];

/** 도착지 기반 mock 분석 결과 (P2에서 Claude vision 결과로 대체). */
export function mockScanFor(destination: Country, scannedAt: string): ScanResult {
  const items: ScanItem[] = BASE.map((b, i) => ({ ...b, id: `item-${i}` }));

  // 도착지별 예외 반영 (검역 엄격국)
  if (['AU', 'NZ'].includes(destination.code)) {
    const kimchi = items.find((i) => i.name === '포장 김치');
    if (kimchi) {
      kimchi.verdict = 'danger';
      kimchi.badge = '반입 금지';
      kimchi.reason = '검역 매우 엄격 — 미신고 식품 반입 금지';
      kimchi.caseNote = '실제 $300+ 벌금 사례가 많아요.';
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
