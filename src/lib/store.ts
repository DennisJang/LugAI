import { create } from 'zustand';

import { findCountry, type Country } from './countries';
import type { ScanResult } from './mockScan';

interface TripState {
  destination: Country;
  setDestination: (c: Country) => void;
  currentScan: ScanResult | null;
  setCurrentScan: (s: ScanResult | null) => void;
}

const DEFAULT_DESTINATION = findCountry('JP')!;

export const useTripStore = create<TripState>((set) => ({
  destination: DEFAULT_DESTINATION,
  setDestination: (destination) => set({ destination }),
  currentScan: null,
  setCurrentScan: (currentScan) => set({ currentScan }),
}));
