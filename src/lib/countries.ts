import type { Locale } from './i18n';

export interface Country {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'JP', name: '일본', nameEn: 'Japan', flag: '🇯🇵' },
  { code: 'VN', name: '베트남', nameEn: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: '태국', nameEn: 'Thailand', flag: '🇹🇭' },
  { code: 'US', name: '미국', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'TW', name: '대만', nameEn: 'Taiwan', flag: '🇹🇼' },
  { code: 'SG', name: '싱가포르', nameEn: 'Singapore', flag: '🇸🇬' },
  { code: 'PH', name: '필리핀', nameEn: 'Philippines', flag: '🇵🇭' },
  { code: 'FR', name: '프랑스', nameEn: 'France', flag: '🇫🇷' },
  { code: 'IT', name: '이탈리아', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: '스페인', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'GB', name: '영국', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: '독일', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'AU', name: '호주', nameEn: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: '뉴질랜드', nameEn: 'New Zealand', flag: '🇳🇿' },
  { code: 'CN', name: '중국', nameEn: 'China', flag: '🇨🇳' },
  { code: 'HK', name: '홍콩', nameEn: 'Hong Kong', flag: '🇭🇰' },
  { code: 'MY', name: '말레이시아', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: '인도네시아', nameEn: 'Indonesia', flag: '🇮🇩' },
  { code: 'AE', name: '아랍에미리트', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'TR', name: '튀르키예', nameEn: 'Türkiye', flag: '🇹🇷' },
  { code: 'CA', name: '캐나다', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'CH', name: '스위스', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'NL', name: '네덜란드', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'IN', name: '인도', nameEn: 'India', flag: '🇮🇳' },
];

export const POPULAR_CODES = ['JP', 'VN', 'TH', 'US', 'TW', 'SG', 'FR', 'AU'];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function countryName(c: Country, locale: Locale): string {
  return locale === 'en' ? c.nameEn ?? c.name : c.name ?? c.nameEn;
}
