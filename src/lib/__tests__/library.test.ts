import { buildLibrary } from '@/lib/library';
import type { ScanItem } from '@/lib/mockScan';
import type { Trip } from '@/lib/store';

const item = (name: string, verdict: ScanItem['verdict'], emoji = '📦'): ScanItem => ({
  id: name,
  emoji,
  name,
  verdict,
  badge: 'x',
  reason: '',
  detail: '',
  source: '',
});

const trip = (id: string, items: ScanItem[]): Trip => ({
  id,
  destination: { code: 'JP', name: '일본', nameEn: 'Japan', nameJa: '日本', nameZh: '日本', flag: '🇯🇵' },
  createdAt: 'x',
  items,
});

describe('buildLibrary', () => {
  it('dedups by name, counts occurrences, keeps most severe verdict', () => {
    const trips: Trip[] = [
      trip('1', [item('Power bank', 'warning', '🔋'), item('Toner', 'success')]),
      trip('2', [item('Power bank', 'danger', '🔋'), item('Knife', 'warning')]),
    ];
    const lib = buildLibrary(trips);
    const pb = lib.find((l) => l.name === 'Power bank')!;
    expect(pb.count).toBe(2);
    expect(pb.verdict).toBe('danger'); // 가장 보수적
    expect(pb.emoji).toBe('🔋');
    expect(lib).toHaveLength(3);
  });

  it('sorts by count desc then name', () => {
    const trips: Trip[] = [
      trip('1', [item('B', 'success'), item('A', 'success')]),
      trip('2', [item('B', 'success')]),
    ];
    const lib = buildLibrary(trips);
    expect(lib.map((l) => l.name)).toEqual(['B', 'A']);
  });

  it('returns [] for no trips', () => {
    expect(buildLibrary([])).toEqual([]);
  });
});
