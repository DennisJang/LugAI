import { buildClaimText, claimTotal, isIncluded, type ClaimLabels } from '@/lib/claim';
import type { ScanItem } from '@/lib/mockScan';
import type { ClaimDraft } from '@/lib/store';

const items: ScanItem[] = [
  { id: 'a', emoji: '🔋', name: 'Power bank', verdict: 'warning', badge: 'x', reason: '', detail: '', source: '' },
  { id: 'b', emoji: '🧴', name: 'Toner', verdict: 'danger', badge: 'x', reason: '', detail: '', source: '' },
];
const labels: ClaimLabels = {
  title: 'Lost Baggage List',
  airline: 'Airline',
  flightNo: 'Flight',
  bagTag: 'Tag',
  lostDate: 'Date',
  destination: 'Destination',
  items: 'Items',
  total: 'Total',
  disclaimer: 'Self-prepared, not official.',
};

describe('claim', () => {
  it('sums only included item values', () => {
    const draft: ClaimDraft = { values: { a: 50000, b: 15000 }, excluded: ['b'] };
    expect(isIncluded(draft, 'a')).toBe(true);
    expect(isIncluded(draft, 'b')).toBe(false);
    expect(claimTotal(draft, items)).toBe(50000);
  });

  it('builds a claim text with meta, included items, and total', () => {
    const draft: ClaimDraft = { airline: 'KE', flightNo: 'KE001', values: { a: 50000, b: 15000 }, excluded: [] };
    const text = buildClaimText({ destinationName: 'Japan', draft, items, labels });
    expect(text).toContain('[Lost Baggage List]');
    expect(text).toContain('Airline: KE');
    expect(text).toContain('Power bank — 50,000');
    expect(text).toContain('Toner — 15,000');
    expect(text).toContain('Total: 65,000');
    expect(text).toContain('Self-prepared, not official.');
  });

  it('excludes items from the text and total', () => {
    const draft: ClaimDraft = { values: { a: 50000, b: 15000 }, excluded: ['b'] };
    const text = buildClaimText({ destinationName: 'Japan', draft, items, labels });
    expect(text).toContain('Power bank');
    expect(text).not.toContain('Toner');
    expect(text).toContain('Total: 50,000');
  });
});
