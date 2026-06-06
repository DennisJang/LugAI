import type { Locale } from './i18n';

export interface Country {
  code: string;
  name: string;
  nameEn: string;
  nameJa: string;
  nameZh: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'JP', name: '일본', nameEn: 'Japan', nameJa: '日本', nameZh: '日本', flag: '🇯🇵' },
  { code: 'VN', name: '베트남', nameEn: 'Vietnam', nameJa: 'ベトナム', nameZh: '越南', flag: '🇻🇳' },
  { code: 'TH', name: '태국', nameEn: 'Thailand', nameJa: 'タイ', nameZh: '泰国', flag: '🇹🇭' },
  { code: 'US', name: '미국', nameEn: 'United States', nameJa: 'アメリカ', nameZh: '美国', flag: '🇺🇸' },
  { code: 'TW', name: '대만', nameEn: 'Taiwan', nameJa: '台湾', nameZh: '台湾', flag: '🇹🇼' },
  { code: 'SG', name: '싱가포르', nameEn: 'Singapore', nameJa: 'シンガポール', nameZh: '新加坡', flag: '🇸🇬' },
  { code: 'PH', name: '필리핀', nameEn: 'Philippines', nameJa: 'フィリピン', nameZh: '菲律宾', flag: '🇵🇭' },
  { code: 'FR', name: '프랑스', nameEn: 'France', nameJa: 'フランス', nameZh: '法国', flag: '🇫🇷' },
  { code: 'IT', name: '이탈리아', nameEn: 'Italy', nameJa: 'イタリア', nameZh: '意大利', flag: '🇮🇹' },
  { code: 'ES', name: '스페인', nameEn: 'Spain', nameJa: 'スペイン', nameZh: '西班牙', flag: '🇪🇸' },
  { code: 'GB', name: '영국', nameEn: 'United Kingdom', nameJa: 'イギリス', nameZh: '英国', flag: '🇬🇧' },
  { code: 'DE', name: '독일', nameEn: 'Germany', nameJa: 'ドイツ', nameZh: '德国', flag: '🇩🇪' },
  { code: 'AU', name: '호주', nameEn: 'Australia', nameJa: 'オーストラリア', nameZh: '澳大利亚', flag: '🇦🇺' },
  { code: 'NZ', name: '뉴질랜드', nameEn: 'New Zealand', nameJa: 'ニュージーランド', nameZh: '新西兰', flag: '🇳🇿' },
  { code: 'CN', name: '중국', nameEn: 'China', nameJa: '中国', nameZh: '中国', flag: '🇨🇳' },
  { code: 'HK', name: '홍콩', nameEn: 'Hong Kong', nameJa: '香港', nameZh: '香港', flag: '🇭🇰' },
  { code: 'MY', name: '말레이시아', nameEn: 'Malaysia', nameJa: 'マレーシア', nameZh: '马来西亚', flag: '🇲🇾' },
  { code: 'ID', name: '인도네시아', nameEn: 'Indonesia', nameJa: 'インドネシア', nameZh: '印度尼西亚', flag: '🇮🇩' },
  { code: 'AE', name: '아랍에미리트', nameEn: 'UAE', nameJa: 'アラブ首長国連邦', nameZh: '阿联酋', flag: '🇦🇪' },
  { code: 'TR', name: '튀르키예', nameEn: 'Türkiye', nameJa: 'トルコ', nameZh: '土耳其', flag: '🇹🇷' },
  { code: 'CA', name: '캐나다', nameEn: 'Canada', nameJa: 'カナダ', nameZh: '加拿大', flag: '🇨🇦' },
  { code: 'CH', name: '스위스', nameEn: 'Switzerland', nameJa: 'スイス', nameZh: '瑞士', flag: '🇨🇭' },
  { code: 'NL', name: '네덜란드', nameEn: 'Netherlands', nameJa: 'オランダ', nameZh: '荷兰', flag: '🇳🇱' },
  { code: 'IN', name: '인도', nameEn: 'India', nameJa: 'インド', nameZh: '印度', flag: '🇮🇳' },
];

export const POPULAR_CODES = ['JP', 'VN', 'TH', 'US', 'TW', 'SG', 'FR', 'AU'];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function countryName(c: Country, locale: Locale): string {
  switch (locale) {
    case 'ko':
      return c.name;
    case 'ja':
      return c.nameJa ?? c.nameEn;
    case 'zh':
      return c.nameZh ?? c.nameEn;
    default:
      return c.nameEn;
  }
}
