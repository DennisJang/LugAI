import type { VerdictKey } from '@/design';

/**
 * 평가 하니스용 라벨 케이스 (P5).
 *
 * 측정 대상: 결정적 규칙/grounding 선택 레이어 — (카테고리, 도착지, 라벨수치)로
 * 기대 verdict·badge bucket·출처 인용이 나오는지. vision/OCR/LLM 최종판단은 여기서
 * 측정하지 않음(배포 후 동일 케이스셋·스코어러를 aiPredictor로 재사용).
 */

/** 판정 결정 요인이 같은 물품 묶음. BASELINE[].id + general. */
export type Category =
  | 'liquids'
  | 'powerbank'
  | 'blade'
  | 'lighter'
  | 'vape'
  | 'powder'
  | 'food'
  | 'flammable'
  | 'general';

/**
 * 로케일 독립 배치/조치 버킷 — 지역화된 badge 문자열('기내만' vs 'Cabin only')에
 * 묶이지 않게 추상화해 채점을 견고하게.
 */
export type BadgeBucket =
  | 'cabin-only' // 위탁 금지, 기내 OK (보조배터리·전자담배)
  | 'checked-only' // 기내 금지 (날붙이)
  | 'over-limit' // 수치 한도 초과 (100ml 초과 액체)
  | 'ok' // 그대로 허용 (≤100ml 액체, 손톱깎이)
  | 'restricted' // 1인1개·신고·추가검색·표기 등 조건 (라이터·분말·식품·CN 보배)
  | 'prohibited'; // 전면 금지 (인화성·태국 전자담배·AU/NZ 미신고 식품)

export interface EvalCase {
  /** 안정 ID */
  id: string;
  category: Category;
  /** 리포트용 영문 라벨 */
  itemName: string;
  /** OCR 축 사실: '120ml' | '20,000mAh' | '160Wh' | '400g' */
  measurement?: string;
  /** 수량 축 메타데이터(예: 라이터 1) — 현재 predictor는 미사용, 수량 의존 규칙 도입 시 활용. */
  quantity?: number;
  /** ISO-2 도착지 코드 (countries.ts / COUNTRY_NOTES 키와 일치) */
  destCode: string;
  expectedVerdict: VerdictKey;
  expectedBadgeBucket: BadgeBucket;
  /** grounding/source가 반드시 포함해야 하는 권위 출처 부분문자열 (출처 인용 검증) */
  sourceMustMention?: string;
}

/**
 * 시드 케이스. 전 카테고리 + 핵심 국가 예외(AU/NZ 검역, TH 전자담배, CN 보배 표기,
 * 액체 100ml 경계, 보배 160Wh 금지선)를 커버. 기대값은 권위 출처(TSA/IATA/각국) 기준 라벨.
 */
export const CASES: EvalCase[] = [
  // 액체 — 100ml 경계 (OCR 수치 축)
  { id: 'liquids-120-us', category: 'liquids', itemName: '120ml toner', measurement: '120ml', destCode: 'US', expectedVerdict: 'danger', expectedBadgeBucket: 'over-limit', sourceMustMention: 'TSA' },
  { id: 'liquids-50-us', category: 'liquids', itemName: '50ml sunscreen', measurement: '50ml', destCode: 'US', expectedVerdict: 'success', expectedBadgeBucket: 'ok', sourceMustMention: 'TSA' },
  { id: 'liquids-100-jp', category: 'liquids', itemName: '100ml lotion', measurement: '100ml', destCode: 'JP', expectedVerdict: 'success', expectedBadgeBucket: 'ok', sourceMustMention: 'TSA' },
  // 리튬·보조배터리 (Wh/mAh)
  { id: 'powerbank-20000-jp', category: 'powerbank', itemName: '20,000mAh power bank', measurement: '20,000mAh', destCode: 'JP', expectedVerdict: 'warning', expectedBadgeBucket: 'cabin-only', sourceMustMention: 'IATA' },
  { id: 'powerbank-160wh-us', category: 'powerbank', itemName: '160Wh battery', measurement: '160Wh', destCode: 'US', expectedVerdict: 'warning', expectedBadgeBucket: 'cabin-only', sourceMustMention: 'IATA' },
  // >160Wh = 전면 금지(IATA). 가장 고위험 보배 결과 → danger 안전 불변식 커버.
  { id: 'powerbank-200wh-us', category: 'powerbank', itemName: '200Wh battery', measurement: '200Wh', destCode: 'US', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: 'IATA' },
  { id: 'powerbank-unmarked-cn', category: 'powerbank', itemName: 'unmarked power bank', destCode: 'CN', expectedVerdict: 'warning', expectedBadgeBucket: 'restricted', sourceMustMention: 'CAAC' },
  // 날붙이
  { id: 'blade-swiss-us', category: 'blade', itemName: 'Swiss army knife', destCode: 'US', expectedVerdict: 'warning', expectedBadgeBucket: 'checked-only', sourceMustMention: 'TSA' },
  // 라이터 (수량 축)
  { id: 'lighter-1-jp', category: 'lighter', itemName: 'lighter', quantity: 1, destCode: 'JP', expectedVerdict: 'danger', expectedBadgeBucket: 'restricted', sourceMustMention: 'FAA' },
  { id: 'lighter-1-us', category: 'lighter', itemName: 'lighter', quantity: 1, destCode: 'US', expectedVerdict: 'danger', expectedBadgeBucket: 'restricted', sourceMustMention: 'FAA' },
  // 전자담배 (도착지 예외 축)
  { id: 'vape-th', category: 'vape', itemName: 'e-cigarette', destCode: 'TH', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: '태국' },
  { id: 'vape-jp', category: 'vape', itemName: 'e-cigarette', destCode: 'JP', expectedVerdict: 'warning', expectedBadgeBucket: 'cabin-only', sourceMustMention: 'IATA' },
  { id: 'vape-vn', category: 'vape', itemName: 'e-cigarette', destCode: 'VN', expectedVerdict: 'warning', expectedBadgeBucket: 'cabin-only', sourceMustMention: 'IATA' },
  // 분말
  { id: 'powder-400-us', category: 'powder', itemName: '400g protein powder', measurement: '400g', destCode: 'US', expectedVerdict: 'info', expectedBadgeBucket: 'restricted', sourceMustMention: 'TSA' },
  // 식품·농산물 (검역 예외 축)
  { id: 'food-kimchi-au', category: 'food', itemName: 'packaged kimchi', destCode: 'AU', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: 'DAFF' },
  { id: 'food-kimchi-nz', category: 'food', itemName: 'packaged kimchi', destCode: 'NZ', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: 'MPI' },
  { id: 'food-kimchi-jp', category: 'food', itemName: 'packaged kimchi', destCode: 'JP', expectedVerdict: 'info', expectedBadgeBucket: 'restricted', sourceMustMention: '검역' },
  { id: 'food-snack-us', category: 'food', itemName: 'packaged snack', destCode: 'US', expectedVerdict: 'info', expectedBadgeBucket: 'restricted', sourceMustMention: 'USDA' },
  // 인화성·압축가스
  { id: 'flammable-butane-jp', category: 'flammable', itemName: 'butane canister', destCode: 'JP', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: 'IATA' },
  { id: 'flammable-spray-us', category: 'flammable', itemName: 'flammable spray', destCode: 'US', expectedVerdict: 'danger', expectedBadgeBucket: 'prohibited', sourceMustMention: 'IATA' },
  // 일반
  { id: 'general-clippers-us', category: 'general', itemName: 'nail clippers', destCode: 'US', expectedVerdict: 'success', expectedBadgeBucket: 'ok' },
  { id: 'general-tshirt-fr', category: 'general', itemName: 't-shirt', destCode: 'FR', expectedVerdict: 'success', expectedBadgeBucket: 'ok' },
];
