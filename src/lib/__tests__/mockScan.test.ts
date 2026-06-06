import { findCountry } from '@/lib/countries';
import { groupByVerdict, mockScanFor } from '@/lib/mockScan';

describe('mockScan', () => {
  it('returns localized items', () => {
    const r = mockScanFor(findCountry('JP')!, '2026-01-01T00:00:00Z', 'en');
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((i) => i.name && i.badge && i.source)).toBe(true);
  });

  it('marks food prohibited for strict-quarantine countries', () => {
    const au = mockScanFor(findCountry('AU')!, 'x', 'en');
    const food = au.items.find((i) => i.id === 'item-6');
    expect(food?.verdict).toBe('danger');
  });

  it('groupByVerdict covers all items', () => {
    const r = mockScanFor(findCountry('JP')!, 'x', 'ko');
    const g = groupByVerdict(r.items);
    expect(g.danger.length + g.warning.length + g.success.length + g.info.length).toBe(r.items.length);
  });
});
