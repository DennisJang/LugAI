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
    return getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en';
  } catch {
    return 'ko';
  }
}

interface TripState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      locale: deviceLocale(),
      setLocale: (locale) => set({ locale }),
      onboarded: false,
      setOnboarded: (onboarded) => set({ onboarded }),
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
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // 구버전에 저장된 Country(nameEn 없음) → 코드로 재해석해 보강
      migrate: (persisted) => {
        const p = persisted as { destination?: Country; trips?: Trip[] } | null;
        if (p && typeof p === 'object') {
          const fix = (c?: Country) => (c?.code ? findCountry(c.code) ?? c : c);
          if (p.destination) p.destination = fix(p.destination) as Country;
          if (Array.isArray(p.trips)) {
            p.trips = p.trips.map((tr) => ({ ...tr, destination: fix(tr.destination) as Country }));
          }
        }
        return p as TripState;
      },
      partialize: (s) => ({
        destination: s.destination,
        trips: s.trips,
        locale: s.locale,
        onboarded: s.onboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
