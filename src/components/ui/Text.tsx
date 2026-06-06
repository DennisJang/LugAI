import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type ThemeColors, typography, type TypographyVariant, useTheme } from '@/design';

const TEXT_COLOR_KEYS = [
  'text',
  'textSecondary',
  'textTertiary',
  'primary',
  'primaryPressed',
  'onPrimary',
] as const;

type TextColorKey = (typeof TEXT_COLOR_KEYS)[number];

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** 테마 색 키 또는 raw 색상 문자열 */
  color?: TextColorKey | (string & {});
  center?: boolean;
  muted?: boolean;
}

function resolveColor(colors: ThemeColors, color?: string, muted?: boolean): string {
  if (!color) return muted ? colors.textSecondary : colors.text;
  if ((TEXT_COLOR_KEYS as readonly string[]).includes(color)) {
    return colors[color as TextColorKey];
  }
  return color;
}

/** 타입드 타이포 텍스트. variant로 스케일, color로 테마색/raw색 지정. */
export function Text({ variant = 'body', color, center, muted, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      style={[
        typography[variant],
        { color: resolveColor(colors, color, muted) },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
