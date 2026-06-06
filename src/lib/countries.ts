export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'TW', name: '대만', flag: '🇹🇼' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
  { code: 'PH', name: '필리핀', flag: '🇵🇭' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'IT', name: '이탈리아', flag: '🇮🇹' },
  { code: 'ES', name: '스페인', flag: '🇪🇸' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'AU', name: '호주', flag: '🇦🇺' },
  { code: 'NZ', name: '뉴질랜드', flag: '🇳🇿' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'HK', name: '홍콩', flag: '🇭🇰' },
  { code: 'MY', name: '말레이시아', flag: '🇲🇾' },
  { code: 'ID', name: '인도네시아', flag: '🇮🇩' },
  { code: 'AE', name: '아랍에미리트', flag: '🇦🇪' },
  { code: 'TR', name: '튀르키예', flag: '🇹🇷' },
  { code: 'CA', name: '캐나다', flag: '🇨🇦' },
  { code: 'CH', name: '스위스', flag: '🇨🇭' },
  { code: 'NL', name: '네덜란드', flag: '🇳🇱' },
  { code: 'IN', name: '인도', flag: '🇮🇳' },
];

export const POPULAR_CODES = ['JP', 'VN', 'TH', 'US', 'TW', 'SG', 'FR', 'AU'];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
