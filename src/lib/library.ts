import type { VerdictKey } from '@/design';

import { VERDICT_ORDER } from './mockScan';
import type { Trip } from './store';

export interface LibraryItem {
  /** dedup 키(물품명 정규화) */
  key: string;
  emoji: string;
  name: string;
  /** 저장된 여행들에서 등장한 횟수 */
  count: number;
  /** 가장 보수적인(심각한) 판정 */
  verdict: VerdictKey;
  category?: string;
}

/**
 * 저장된 여행들의 물품을 물품명 기준으로 집계 → "내 짐" 라이브러리.
 * 쓸수록 쌓이는 자산. 같은 물품은 횟수 누적, 판정은 가장 보수적인 것으로.
 */
export function buildLibrary(trips: Trip[]): LibraryItem[] {
  const map = new Map<string, LibraryItem>();
  for (const trip of trips) {
    for (const it of trip.items) {
      const key = it.name.trim().toLowerCase();
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (VERDICT_ORDER.indexOf(it.verdict) < VERDICT_ORDER.indexOf(existing.verdict)) existing.verdict = it.verdict;
        if (!existing.category && it.category) existing.category = it.category;
      } else {
        map.set(key, { key, emoji: it.emoji, name: it.name, count: 1, verdict: it.verdict, category: it.category });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
