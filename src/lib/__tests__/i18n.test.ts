import { pick, t } from '@/lib/i18n';

describe('i18n', () => {
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
