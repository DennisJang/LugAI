import { BASELINE, countryNotes, groundingText } from '@/lib/regulations';

describe('regulations', () => {
  it('has baseline rules', () => {
    expect(BASELINE.length).toBeGreaterThan(5);
    expect(BASELINE.every((r) => r.source && r.title.en)).toBe(true);
  });

  it('provides country-specific notes', () => {
    expect(countryNotes('AU').length).toBeGreaterThan(0);
    expect(countryNotes('ZZ')).toEqual([]);
  });

  it('grounding text includes baseline and destination notes', () => {
    const g = groundingText('TH');
    expect(g).toContain('GENERAL BASELINE');
    expect(g).toContain('TH');
  });
});
