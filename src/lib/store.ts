import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { findCountry, type Country } from './countries';
import type { Locale } from './i18n';
import type { ScanItem, ScanResult } from './mockScan';

export interface Trip {
  id: string;
  destination: Country;
  createdAt: string;
  items: ScanItem[];
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
  /** 익명 피드백 클러스터링용 무작위 ID (PII 아님, 영속) */
  anonId: string;
  /** 이미 피드백을 보낸 항목 키(`${destCode}|${itemKey}`) — 중복 제출 방지(영속) */
  feedbackKeys: string[];
  markFeedback: (key: string) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  units: 'metric' | 'imperial';
  setUnits: (u: 'metric' | 'imperial') => void;
  destination: Country;
  setDestination: (c: Country) => void;
  /** 카메라/앨범에서 받은 이미지(임시, 영속화 안 함) */
  pendingImage: PendingImage | null;
  setPendingImage: (img: PendingImage | null) => void;
  /** 분석 직후 결과(임시, 영속화 안 함) */
  currentScan: ScanResult | null;
  setCurrentScan: (s: ScanResult | null) => void;
  trips: Trip[];
  addTrip: (scan: ScanResult) => void;
  removeTrip: (id: string) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

function makeId(): string {
  return `trip-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function makeAnonId(): string {
  return `anon-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      anonId: makeAnonId(),
      feedbackKeys: [],
      markFeedback: (key) =>
        set((s) => (s.feedbackKeys.includes(key) ? s : { feedbackKeys: [...s.feedbackKeys, key] })),
      locale: deviceLocale(),
      setLocale: (locale) => set({ locale }),
      onboarded: false,
      setOnboarded: (onboarded) => set({ onboarded }),
      units: 'metric',
      setUnits: (units) => set({ units }),
      destination: findCountry('JP')!,
      setDestination: (destination) => set({ destination }),
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
      removeTrip: (id) => set({ trips: get().trips.filter((t) => t.id !== id) }),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'lugai-store',
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      // v3→: 저장된 Country 보강 + 신규 필드(anonId/feedbackKeys) 백필(결정적 영속)
      migrate: (persisted) => {
        const p = persisted as { destination?: Country; trips?: Trip[]; anonId?: string; feedbackKeys?: string[] } | null;
        if (p && typeof p === 'object') {
          const fix = (c?: Country) => (c?.code ? findCountry(c.code) ?? c : c);
          if (p.destination) p.destination = fix(p.destination) as Country;
          if (Array.isArray(p.trips)) {
            p.trips = p.trips.map((tr) => ({ ...tr, destination: fix(tr.destination) as Country }));
          }
          if (!p.anonId) p.anonId = makeAnonId();
          if (!Array.isArray(p.feedbackKeys)) p.feedbackKeys = [];
        }
        return p as TripState;
      },
      partialize: (s) => ({
        anonId: s.anonId,
        feedbackKeys: s.feedbackKeys,
        destination: s.destination,
        trips: s.trips,
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
