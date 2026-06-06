/**
 * LugAI Theme — 의미 기반 색(light/dark) + useTheme().
 * 정적 토큰(typography/space/radius/shadow/motion)은 tokens.ts에서 직접 import.
 */
import { useColorScheme } from '@/hooks/use-color-scheme';

import { palette } from './tokens';

export type ColorScheme = 'light' | 'dark';

export interface VerdictColor {
  /** 강조(아이콘/뱃지 솔리드) */
  solid: string;
  /** 틴트 배경 위 텍스트/아이콘 */
  fg: string;
  /** 틴트 배경 */
  bg: string;
  /** 틴트 테두리 */
  border: string;
}

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  card: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryPressed: string;
  primaryTint: string;
  onPrimary: string;
  overlay: string;
  verdict: {
    success: VerdictColor;
    warning: VerdictColor;
    danger: VerdictColor;
    info: VerdictColor;
  };
}

export const lightColors: ThemeColors = {
  background: '#EFF1F4',
  backgroundAlt: '#E7EAEE',
  surface: palette.white,
  card: palette.white,
  border: palette.gray[200],
  borderSubtle: palette.gray[100],
  text: palette.gray[900],
  textSecondary: palette.gray[600],
  textTertiary: palette.gray[500],
  primary: palette.brand[500],
  primaryPressed: palette.brand[600],
  primaryTint: palette.brand[50],
  onPrimary: palette.white,
  overlay: 'rgba(8,12,20,0.45)',
  verdict: {
    success: { solid: palette.green[500], fg: palette.green[700], bg: palette.green[50], border: palette.green[100] },
    warning: { solid: palette.amber[500], fg: palette.amber[700], bg: palette.amber[50], border: palette.amber[100] },
    danger: { solid: palette.red[500], fg: palette.red[700], bg: palette.red[50], border: palette.red[100] },
    info: { solid: palette.brand[500], fg: palette.brand[700], bg: palette.brand[50], border: palette.brand[100] },
  },
};

export const darkColors: ThemeColors = {
  background: palette.gray[950],
  backgroundAlt: '#14181E',
  surface: '#161B22',
  card: '#161B22',
  border: '#262C35',
  borderSubtle: '#1C2228',
  text: '#F2F4F7',
  textSecondary: palette.gray[400],
  textTertiary: palette.gray[500],
  primary: palette.brand[400],
  primaryPressed: palette.brand[300],
  primaryTint: 'rgba(45,107,255,0.16)',
  onPrimary: palette.white,
  overlay: 'rgba(0,0,0,0.6)',
  verdict: {
    success: { solid: palette.green[500], fg: '#5BD99A', bg: 'rgba(22,179,100,0.16)', border: 'rgba(22,179,100,0.30)' },
    warning: { solid: palette.amber[500], fg: '#FBBF5B', bg: 'rgba(247,144,9,0.16)', border: 'rgba(247,144,9,0.30)' },
    danger: { solid: palette.red[500], fg: '#F79289', bg: 'rgba(240,68,56,0.16)', border: 'rgba(240,68,56,0.30)' },
    info: { solid: palette.brand[400], fg: '#8AAEFF', bg: 'rgba(45,107,255,0.16)', border: 'rgba(45,107,255,0.30)' },
  },
};

export type VerdictKey = keyof ThemeColors['verdict'];

export function useTheme(): { colors: ThemeColors; scheme: ColorScheme } {
  const scheme = (useColorScheme() ?? 'light') as ColorScheme;
  return { colors: scheme === 'dark' ? darkColors : lightColors, scheme };
}
