import type { Locale } from './i18n';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TIMEOUT_MS = 10000;

export type StorageKind = 'locker' | 'staffed' | 'shop';
export type StorageIssue = 'closed' | 'moved' | 'wrong_price' | 'wrong_hours' | 'other';

export interface StorageSpot {
  id: number;
  name: string;
  name_en: string | null;
  kind: StorageKind;
  lat: number;
  lng: number;
  city: string | null;
  country_code: string | null;
  address: string | null;
  hours: string | null;
  price_text: string | null;
  source: string;
  verified_at: string | null;
  distance_km: number;
}

/** 목적지 국가 → 대표 도시 중심좌표(현위치 GPS 도입 전 v1 앵커). 시드 도시 우선. */
const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  KR: { lat: 37.5547, lng: 126.9707 }, // 서울역
  JP: { lat: 35.6812, lng: 139.7671 }, // 도쿄역
};

export function destCoords(countryCode: string): { lat: number; lng: number } | null {
  return DEST_COORDS[countryCode] ?? null;
}

/** 좌표 기준 근처 보관소 조회. 키 미설정·오프라인·오류 시 빈 배열(graceful). */
export async function fetchNearbyStorage(lat: number, lng: number, radiusKm = 3): Promise<StorageSpot[]> {
  if (!SUPABASE_URL || !ANON_KEY) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/nearby-storage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ lat, lng, radiusKm }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { spots?: StorageSpot[] };
    return Array.isArray(data?.spots) ? data.spots : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** 보관소 폐업/오류 제보. 사용자 명시 행동만, graceful. */
export async function submitStorageReport(params: {
  anonId: string;
  spotId: number;
  issue: StorageIssue;
  note?: string;
}): Promise<boolean> {
  if (!SUPABASE_URL || !ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/report-storage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** 거리 표기: <1km는 m, 그 이상은 km. */
export function formatDistance(km: number, locale: Locale): string {
  if (!Number.isFinite(km)) return '';
  if (km < 1) {
    const m = Math.round(km * 1000);
    return locale === 'en' ? `${m} m` : `${m}m`;
  }
  return `${km.toFixed(1)}km`;
}

/** 신선도 라벨: "오늘 확인" / "N일 전 확인" / "N개월 전 확인". now는 주입 가능(테스트). */
export function freshnessLabel(verifiedAt: string | null, locale: Locale, now: number = Date.now()): string {
  if (!verifiedAt) return '';
  const t = Date.parse(verifiedAt);
  if (Number.isNaN(t)) return '';
  const days = Math.max(0, Math.floor((now - t) / 86_400_000));
  const en = locale === 'en';
  if (days === 0) return en ? 'Verified today' : '오늘 확인';
  if (days < 30) return en ? `Verified ${days}d ago` : `${days}일 전 확인`;
  const months = Math.floor(days / 30);
  return en ? `Verified ${months}mo ago` : `${months}개월 전 확인`;
}
