import { destCoords, fetchNearbyStorage, formatDistance, freshnessLabel, submitStorageReport } from '@/lib/storage';

describe('storage helpers', () => {
  it('returns [] / false gracefully when Supabase env is unset', async () => {
    expect(await fetchNearbyStorage(37.5, 127.0)).toEqual([]);
    expect(await submitStorageReport({ anonId: 'a', spotId: 1, issue: 'closed' })).toBe(false);
  });

  it('maps seeded destinations to coordinates', () => {
    expect(destCoords('KR')).toBeTruthy();
    expect(destCoords('JP')).toBeTruthy();
    expect(destCoords('ZZ')).toBeNull();
  });

  it('formats distance in m below 1km and km above', () => {
    expect(formatDistance(0.32, 'ko')).toBe('320m');
    expect(formatDistance(1.25, 'ko')).toBe('1.3km');
    expect(formatDistance(0.32, 'en')).toBe('320 m');
  });

  it('formats freshness relative to now', () => {
    const now = Date.parse('2026-06-10T00:00:00Z');
    expect(freshnessLabel('2026-06-10T00:00:00Z', 'ko', now)).toBe('오늘 확인');
    expect(freshnessLabel('2026-06-07T00:00:00Z', 'ko', now)).toBe('3일 전 확인');
    expect(freshnessLabel('2026-04-01T00:00:00Z', 'en', now)).toMatch(/mo ago/);
    expect(freshnessLabel(null, 'ko', now)).toBe('');
  });
});
