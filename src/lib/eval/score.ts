import type { VerdictKey } from '@/design';

import { BASELINE, countryNotes } from '../regulations';
import type { BadgeBucket, Category, EvalCase } from './cases';

/** 예측 결과 — predictor가 케이스에 대해 내놓는 판정. */
export interface Prediction {
  verdict: VerdictKey;
  badge: BadgeBucket;
  /** 이 판정의 근거 출처(관련 규칙으로 스코프) — 출처 인용 검증용 */
  source: string;
}

/**
 * 플러그블 predictor. 지금은 결정적 groundingPredictor, 배포 후 동일 시그니처의
 * aiPredictor(Edge Function 호출)로 같은 케이스셋·스코어러를 재사용한다.
 */
export type Predictor = (c: EvalCase) => Prediction;

/** 카테고리별 기본 배치 버킷. */
const DEFAULT_BUCKET: Record<Category, BadgeBucket> = {
  liquids: 'ok',
  powerbank: 'cabin-only',
  blade: 'checked-only',
  lighter: 'restricted',
  vape: 'cabin-only',
  powder: 'restricted',
  food: 'restricted',
  flammable: 'prohibited',
  general: 'ok',
};

/** 검역이 매우 엄격해 미신고 식품이 사실상 금지인 도착지. */
const STRICT_QUARANTINE = ['AU', 'NZ'];
/** 전자담배 반입 자체가 불법인 도착지. */
const VAPE_BAN = ['TH'];

/** 측정 문자열에서 특정 단위의 수치를 추출(없으면 null). 예: parseAmount('120ml','ml')=120. */
function parseAmount(measurement: string | undefined, unit: 'ml' | 'Wh'): number | null {
  if (!measurement) return null;
  const m = measurement.replace(/,/g, '').match(new RegExp(`([\\d.]+)\\s*${unit}`, 'i'));
  return m ? parseFloat(m[1]) : null;
}

/**
 * 결정적 grounding predictor — 규칙 데이터(`BASELINE`/`COUNTRY_NOTES`)와 수치/도착지
 * 결정 로직을 그대로 인코딩. 정밀도가 떨어지면 규칙 레이어의 실제 회귀를 의미한다.
 * source는 `groundingText`(앱이 모델에 주입하는 실제 grounding)를 그대로 사용.
 */
export const groundingPredictor: Predictor = (c) => {
  const base = BASELINE.find((r) => r.id === c.category);
  let verdict: VerdictKey = base ? base.verdict : 'success';
  let badge: BadgeBucket = DEFAULT_BUCKET[c.category];

  // 수치 축(OCR): 액체 100ml / 보조배터리 160Wh
  if (c.category === 'liquids') {
    const ml = parseAmount(c.measurement, 'ml');
    if (ml != null) {
      if (ml > 100) {
        verdict = 'danger';
        badge = 'over-limit';
      } else {
        verdict = 'success';
        badge = 'ok';
      }
    }
  } else if (c.category === 'powerbank') {
    const wh = parseAmount(c.measurement, 'Wh');
    if (wh != null && wh > 160) {
      verdict = 'danger';
      badge = 'prohibited';
    } else {
      verdict = 'warning';
      badge = 'cabin-only';
    }
  }

  // 도착지 예외 축
  if (c.category === 'food' && STRICT_QUARANTINE.includes(c.destCode)) {
    verdict = 'danger';
    badge = 'prohibited';
  }
  if (c.category === 'vape' && VAPE_BAN.includes(c.destCode)) {
    verdict = 'danger';
    badge = 'prohibited';
  }
  if (c.category === 'powerbank' && c.destCode === 'CN') {
    badge = 'restricted'; // 용량 표기·인증 요구
  }

  return { verdict, badge, source: buildSource(c) };
};

/**
 * 이 케이스 판정의 근거 출처 — **관련 규칙으로 스코프**한다(전체 grounding 블롭 X).
 * 카테고리 baseline 규칙의 source + 도착지 특이규정 source만 포함 → 출처 인용 검증이
 * "관련 규칙이 올바른 권위에 근거하는가"를 실제로 측정(엉뚱한 카테고리 출처로 통과 방지).
 */
function buildSource(c: EvalCase): string {
  const baseSrc = BASELINE.find((r) => r.id === c.category)?.source ?? '';
  const destSrc = countryNotes(c.destCode).map((n) => n.source).join(' / ');
  return [baseSrc, destSrc].filter(Boolean).join(' / ');
}

export interface CaseResult {
  case: EvalCase;
  prediction: Prediction;
  verdictOk: boolean;
  badgeOk: boolean;
  sourceOk: boolean;
  pass: boolean;
}

export interface Score {
  total: number;
  correct: number;
  /** correct / total */
  precision: number;
  byCategory: Record<string, { total: number; correct: number }>;
  results: CaseResult[];
}

/** 케이스셋을 predictor로 채점. */
export function score(cases: EvalCase[], predict: Predictor): Score {
  const results: CaseResult[] = cases.map((c) => {
    const prediction = predict(c);
    const verdictOk = prediction.verdict === c.expectedVerdict;
    const badgeOk = prediction.badge === c.expectedBadgeBucket;
    const sourceOk = !c.sourceMustMention || prediction.source.includes(c.sourceMustMention);
    return { case: c, prediction, verdictOk, badgeOk, sourceOk, pass: verdictOk && badgeOk && sourceOk };
  });

  const byCategory: Record<string, { total: number; correct: number }> = {};
  for (const r of results) {
    const k = r.case.category;
    byCategory[k] ??= { total: 0, correct: 0 };
    byCategory[k].total += 1;
    if (r.pass) byCategory[k].correct += 1;
  }

  const correct = results.filter((r) => r.pass).length;
  return { total: results.length, correct, precision: correct / results.length, byCategory, results };
}

/** 콘솔용 리포트(파일 미작성). 카테고리 분해 + 실패 케이스 표시. */
export function formatReport(s: Score): string {
  const pct = (s.precision * 100).toFixed(1);
  const cats = Object.entries(s.byCategory)
    .map(([k, v]) => `${k} ${v.correct}/${v.total}`)
    .join('  ');
  const fails = s.results
    .filter((r) => !r.pass)
    .map((r) => {
      const why = [
        r.verdictOk ? null : `verdict ${r.prediction.verdict}≠${r.case.expectedVerdict}`,
        r.badgeOk ? null : `badge ${r.prediction.badge}≠${r.case.expectedBadgeBucket}`,
        r.sourceOk ? null : `source missing "${r.case.sourceMustMention}"`,
      ]
        .filter(Boolean)
        .join(', ');
      return `  ✗ ${r.case.id}: ${why}`;
    });
  return [
    '=== LugAI eval — grounding predictor ===',
    `cases: ${s.total}  passed: ${s.correct}  precision: ${pct}%`,
    `by category:  ${cats}`,
    fails.length ? `failures:\n${fails.join('\n')}` : 'failures:  (none)',
  ].join('\n');
}

// NOTE(P5→플라이휠): 배포 후 `aiPredictor: Predictor`가 Edge Function을 호출(env 플래그로
// CI는 오프라인 유지)해 같은 CASES·score·formatReport로 실제 파이프라인 정밀도를 수치화한다.
