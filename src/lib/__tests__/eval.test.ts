import { CASES } from '@/lib/eval/cases';
import { formatReport, groundingPredictor, score } from '@/lib/eval/score';

/** 파이프라인 변경마다 규칙 레이어 정밀도 회귀를 막는 가드. */
describe('eval harness (grounding predictor)', () => {
  const s = score(CASES, groundingPredictor);

  it('covers at least 20 labeled cases and prints a report', () => {
    // eslint-disable-next-line no-console
    console.log(formatReport(s));
    expect(s.total).toBeGreaterThanOrEqual(20);
  });

  it('meets the precision threshold', () => {
    const THRESHOLD = 0.9;
    expect(s.precision).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('safety invariant: no false negatives on dangerous items', () => {
    const missed = CASES.filter(
      (c) => c.expectedVerdict === 'danger' && groundingPredictor(c).verdict !== 'danger',
    ).map((c) => c.id);
    expect(missed).toEqual([]);
  });

  it('cites the required authoritative source for every case that needs one', () => {
    const uncited = s.results.filter((r) => !r.sourceOk).map((r) => r.case.id);
    expect(uncited).toEqual([]);
  });
});
