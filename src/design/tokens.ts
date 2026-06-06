/**
 * LugAI Design Tokens — scheme-independent.
 * Toss급 기준: 넉넉한 여백, 큰 타이포, 절제된 색, 스냅한 모션.
 * (색의 의미 매핑은 theme.ts에서)
 */

/* ----------------------------------------------------------------------------
 * Palette (raw colors)
 * ------------------------------------------------------------------------- */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    0: '#FFFFFF',
    50: '#F6F7F9',
    100: '#EDEFF2',
    200: '#E1E4E9',
    300: '#CACFD6',
    400: '#A6ADB8',
    500: '#868D99',
    600: '#5C6470',
    700: '#3A414B',
    800: '#22272E',
    900: '#12151A',
    950: '#0B0E12',
  },

  // Brand blue — 신뢰 / 통관 / 여행
  brand: {
    50: '#EEF4FF',
    100: '#D9E6FF',
    200: '#B6CEFF',
    300: '#8AAEFF',
    400: '#5C87FF',
    500: '#2D6BFF',
    600: '#1F54E6',
    700: '#1842B4',
    800: '#163A8C',
    900: '#16336E',
  },

  green: { 50: '#E7F8EF', 100: '#C7F0D9', 500: '#16B364', 600: '#0E9F57', 700: '#067647' },
  amber: { 50: '#FEF4E6', 100: '#FCE6BE', 500: '#F79009', 600: '#DC7705', 700: '#B54708' },
  red: { 50: '#FDECEA', 100: '#FBD3CE', 500: '#F04438', 600: '#D92D20', 700: '#B42318' },
} as const;

/* ----------------------------------------------------------------------------
 * Spacing — 4pt grid
 * ------------------------------------------------------------------------- */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/* ----------------------------------------------------------------------------
 * Radius
 * ------------------------------------------------------------------------- */
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
} as const;

/* ----------------------------------------------------------------------------
 * Typography — iOS/Android 시스템 폰트(SF Pro / Apple SD Gothic Neo).
 * 한국어 프리미엄 폰트(Pretendard)는 추후 적용.
 * ------------------------------------------------------------------------- */
// Alidoost 톤: 절제된 굵기, 정돈된 자간/행간으로 위계를 크기·색·간격에 맡김.
export const typography = {
  display: { fontSize: 33, lineHeight: 40, fontWeight: '700', letterSpacing: -0.7 },
  title1: { fontSize: 27, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5 },
  title2: { fontSize: 21, lineHeight: 28, fontWeight: '700', letterSpacing: -0.4 },
  title3: { fontSize: 18, lineHeight: 25, fontWeight: '600', letterSpacing: -0.3 },
  headline: { fontSize: 17, lineHeight: 23, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400', letterSpacing: -0.1 },
  bodyStrong: { fontSize: 16, lineHeight: 25, fontWeight: '600', letterSpacing: -0.1 },
  callout: { fontSize: 15, lineHeight: 22, fontWeight: '400', letterSpacing: -0.1 },
  subhead: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: -0.1 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500', letterSpacing: 0 },
  footnote: { fontSize: 12.5, lineHeight: 16, fontWeight: '600', letterSpacing: 0.1 },
} as const;

export type TypographyVariant = keyof typeof typography;

/* ----------------------------------------------------------------------------
 * Shadows — 절제된 elevation (iOS shadow + Android elevation)
 * ------------------------------------------------------------------------- */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

/* ----------------------------------------------------------------------------
 * Motion — Reanimated 4 configs. Toss = 스냅하고 약간의 탄성.
 * ------------------------------------------------------------------------- */
export const spring = {
  default: { damping: 18, stiffness: 220, mass: 1 },
  gentle: { damping: 22, stiffness: 160, mass: 1 },
  snappy: { damping: 26, stiffness: 320, mass: 1 },
  bouncy: { damping: 12, stiffness: 220, mass: 1 },
} as const;

export const duration = { fast: 150, base: 220, slow: 320 } as const;

/** 누름 피드백 스케일 */
export const press = { scale: 0.97 } as const;
