import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { findCountry, type Country } from './countries';
import type { Locale } from './i18n';
import type { ScanItem, ScanResult } from './mockScan';
import type { UpcomingTrip } from './trips';

export interface Trip {
  id: string;
  destination: Country;
  createdAt: string;
  items: ScanItem[];
}

/** 분실 수하물 신고서 초안(여행별). 스캔 기록 = 내용물 증빙. */
export interface ClaimDraft {
  airline?: string;
  flightNo?: string;
  bagTag?: string;
  lostDate?: string;
  /** itemId → 추정 가치(현지 통화, 숫자) */
  values: Record<string, number>;
  /** 신고에서 제외한 itemId */
  excluded: string[];
}

export interface PendingImage {
  base64: string;
  mimeType: string;
}

function deviceLocale(): Locale {
  try {
    const code = getLocales()[0]?.languageCode;
    if (code === 'ko') return 'ko';
    if (code === 'ja') return 'ja';
    if (code === 'zh') return 'zh';
    return 'en';
  } catch {
    return 'en';
  }
}

interface TripState {
  /** 익명 ID 겸 여행 연동 '연결코드'. PII는 아니지만 추측 불가해야 함(CSPRNG, 영속) */
  anonId: string;
  /** 이미 피드백을 보낸 항목 키(`${destCode}|${itemKey}`) — 중복 제출 방지(영속) */
  feedbackKeys: string[];
  markFeedback: (key: string) => void;
  /** 이미 제보한 보관소 id — 세션 내 중복 제보 방지(영속 안 함) */
  reportedSpots: number[];
  markSpotReported: (id: number) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  units: 'metric' | 'imperial';
  setUnits: (u: 'metric' | 'imperial') => void;
  destination: Country;
  setDestination: (c: Country) => void;
  /** 예매에서 자동 수신된 다가오는 여행(영속) */
  upcomingTrip: UpcomingTrip | null;
  setUpcomingTrip: (t: UpcomingTrip | null) => void;
  /** 카메라/앨범에서 받은 이미지(임시, 영속화 안 함) */
  pendingImage: PendingImage | null;
  setPendingImage: (img: PendingImage | null) => void;
  /** 분석 직후 결과(임시, 영속화 안 함) */
  currentScan: ScanResult | null;
  setCurrentScan: (s: ScanResult | null) => void;
  trips: Trip[];
  addTrip: (scan: ScanResult) => void;
  removeTrip: (id: string) => void;
  /** 여행별 분실 신고서 초안(영속) */
  claimDrafts: Record<string, ClaimDraft>;
  setClaimDraft: (tripId: string, draft: ClaimDraft) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

function makeId(): string {
  return `trip-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// 연결코드 겸용이라 추측 불가해야 함 → CSPRNG(UUIDv4, ~122비트). Math.random 사용 금지.
function makeAnonId(): string {
  return `anon-${Crypto.randomUUID()}`;
}

// 신규(UUID) 형식 판별 — 구버전 저혼합도 anonId는 마이그레이션에서 교체한다.
const ANON_RE = /^anon-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      anonId: makeAnonId(),
      feedbackKeys: [],
      markFeedback: (key) =>
        set((s) => (s.feedbackKeys.includes(key) ? s : { feedbackKeys: [...s.feedbackKeys, key] })),
      reportedSpots: [],
      markSpotReported: (id) =>
        set((s) => (s.reportedSpots.includes(id) ? s : { reportedSpots: [...s.reportedSpots, id] })),
      locale: deviceLocale(),
      setLocale: (locale) => set({ locale }),
      onboarded: false,
      setOnboarded: (onboarded) => set({ onboarded }),
      units: 'metric',
      setUnits: (units) => set({ units }),
      destination: findCountry('JP')!,
      setDestination: (destination) => set({ destination }),
      upcomingTrip: null,
      setUpcomingTrip: (upcomingTrip) => set({ upcomingTrip }),
      pendingImage: null,
      setPendingImage: (pendingImage) => set({ pendingImage }),
      currentScan: null,
      setCurrentScan: (currentScan) => set({ currentScan }),
      trips: [],
      addTrip: (scan) =>
        set({
          trips: [
            { id: makeId(), destination: scan.destination, createdAt: scan.scannedAt, items: scan.items },
            ...get().trips,
          ],
        }),
      removeTrip: (id) =>
        set((s) => {
          const { [id]: _drop, ...claimDrafts } = s.claimDrafts;
          return { trips: s.trips.filter((t) => t.id !== id), claimDrafts };
        }),
      claimDrafts: {},
      setClaimDraft: (tripId, draft) => set((s) => ({ claimDrafts: { ...s.claimDrafts, [tripId]: draft } })),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'lugai-store',
      version: 7,
      storage: createJSONStorage(() => AsyncStorage),
      // v3→: 저장된 Country 보강 + 신규 필드(anonId/feedbackKeys/upcomingTrip) 백필(결정적 영속)
      //      + 구버전 저엔트로피 anonId(연결코드)를 CSPRNG로 교체(보안)
      migrate: (persisted) => {
        const p = persisted as {
          destination?: Country;
          trips?: Trip[];
          anonId?: string;
          feedbackKeys?: string[];
          upcomingTrip?: UpcomingTrip | null;
          claimDrafts?: Record<string, ClaimDraft>;
        } | null;
        if (p && typeof p === 'object') {
          const fix = (c?: Country) => (c?.code ? findCountry(c.code) ?? c : c);
          if (p.destination) p.destination = fix(p.destination) as Country;
          if (Array.isArray(p.trips)) {
            p.trips = p.trips.map((tr) => ({ ...tr, destination: fix(tr.destination) as Country }));
          }
          if (!p.anonId || !ANON_RE.test(p.anonId)) p.anonId = makeAnonId();
          if (!Array.isArray(p.feedbackKeys)) p.feedbackKeys = [];
          if (p.upcomingTrip === undefined) p.upcomingTrip = null;
          if (!p.claimDrafts || typeof p.claimDrafts !== 'object') p.claimDrafts = {};
        }
        return p as TripState;
      },
      partialize: (s) => ({
        anonId: s.anonId,
        feedbackKeys: s.feedbackKeys,
        destination: s.destination,
        upcomingTrip: s.upcomingTrip,
        trips: s.trips,
        claimDrafts: s.claimDrafts,
        locale: s.locale,
        onboarded: s.onboarded,
        units: s.units,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
