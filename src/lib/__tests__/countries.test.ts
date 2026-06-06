import { countryName, findCountry } from '@/lib/countries';

describe('countries', () => {
  it('finds by code', () => {
    expect(findCountry('JP')?.nameEn).toBe('Japan');
    expect(findCountry('ZZ')).toBeUndefined();
  });

  it('localizes name across locales', () => {
    const jp = findCountry('JP')!;
    expect(countryName(jp, 'ko')).toBe('일본');
    expect(countryName(jp, 'en')).toBe('Japan');
    expect(countryName(jp, 'ja')).toBe('日本');
    expect(countryName(jp, 'zh')).toBe('日本');
  });
});
