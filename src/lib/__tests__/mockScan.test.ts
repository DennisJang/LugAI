import { findCountry } from '@/lib/countries';
import { computeNeedsRecapture, groupByVerdict, mockScanFor, type ScanItem } from '@/lib/mockScan';

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

  it('assigns a valid confidence to every item', () => {
    const r = mockScanFor(findCountry('JP')!, 'x', 'en');
    expect(r.items.every((i) => ['low', 'medium', 'high'].includes(i.confidence!))).toBe(true);
  });

  it('flags needsRecapture in mock (low-confidence high-risk items present)', () => {
    const r = mockScanFor(findCountry('JP')!, 'x', 'en');
    expect(r.needsRecapture).toBe(true);
  });
});

describe('computeNeedsRecapture', () => {
  const make = (confidence: ScanItem['confidence'], verdict: ScanItem['verdict']): ScanItem => ({
    id: 'x',
    emoji: '📦',
    name: 'x',
    verdict,
    badge: 'x',
    reason: 'x',
    detail: 'x',
    source: 'x',
    confidence,
  });

  it('true when a low-confidence item is high-risk', () => {
    expect(computeNeedsRecapture([make('low', 'danger')])).toBe(true);
    expect(computeNeedsRecapture([make('low', 'warning')])).toBe(true);
  });

  it('false when low-confidence item is low-risk', () => {
    expect(computeNeedsRecapture([make('low', 'success')])).toBe(false);
    expect(computeNeedsRecapture([make('low', 'info')])).toBe(false);
  });

  it('false when high-risk item is confident', () => {
    expect(computeNeedsRecapture([make('high', 'danger')])).toBe(false);
    expect(computeNeedsRecapture([make(undefined, 'danger')])).toBe(false);
  });
});
