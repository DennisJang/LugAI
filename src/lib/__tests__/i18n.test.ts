import { pick, STRINGS, t, type Locale } from '@/lib/i18n';

describe('i18n', () => {
  it('every locale has the exact same key set (no missing/extra translations)', () => {
    const ref = Object.keys(STRINGS.ko).sort();
    for (const loc of Object.keys(STRINGS) as Locale[]) {
      const keys = Object.keys(STRINGS[loc]).sort();
      const missing = ref.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !ref.includes(k));
      expect({ loc, missing, extra }).toEqual({ loc, missing: [], extra: [] });
    }
  });

  it('translates by locale', () => {
    expect(t('en', 'home.startScan')).toBe('Start scan');
    expect(t('ko', 'home.startScan')).toBe('스캔 시작');
    expect(t('ja', 'tab.home')).toBe('ホーム');
    expect(t('zh', 'tab.home')).toBe('首页');
  });

  it('interpolates params', () => {
    expect(t('en', 'home.heroDesc', { country: 'Japan' })).toContain('Japan');
    expect(t('en', 'result.totalItems', { n: 5 })).toContain('5');
  });

  it('falls back to the key when missing', () => {
    expect(t('en', 'does.not.exist')).toBe('does.not.exist');
  });

  it('pick falls back en→ko', () => {
    expect(pick({ ko: '가', en: 'A' }, 'ja')).toBe('A');
    expect(pick({ ko: '가', en: 'A' }, 'zh')).toBe('A');
    expect(pick({ ko: '가' }, 'en')).toBe('가');
    expect(pick({ ko: '가', en: 'A' }, 'ko')).toBe('가');
  });
});
