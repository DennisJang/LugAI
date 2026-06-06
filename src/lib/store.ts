import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { findCountry, type Country } from './countries';
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

interface TripState {
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
            {
              id: makeId(),
              destination: scan.destination,
              createdAt: scan.scannedAt,
              items: scan.items,
            },
            ...get().trips,
          ],
        }),
      removeTrip: (id) => set({ trips: get().trips.filter((t) => t.id !== id) }),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'lugai-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // 임시 상태(pendingImage/currentScan)·플래그는 저장하지 않음
      partialize: (s) => ({ destination: s.destination, trips: s.trips }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
