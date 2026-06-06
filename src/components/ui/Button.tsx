import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { radius, space, type TypographyVariant, useTheme } from '@/design';

import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const SIZE: Record<
  ButtonSize,
  { height: number; radius: number; variant: TypographyVariant; gap: number; px: number }
> = {
  lg: { height: 56, radius: radius.lg, variant: 'headline', gap: space[2], px: space[5] },
  md: { height: 48, radius: 14, variant: 'bodyStrong', gap: space[2], px: space[4] },
  sm: { height: 40, radius: radius.md, variant: 'subhead', gap: space[1], px: space[3] },
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  loading = false,
  leftIcon,
  disabled,
  haptic = 'medium',
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const s = SIZE[size];

  const palettes: Record<ButtonVariant, { bg: string; fg: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.primaryTint, fg: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.verdict.danger.solid, fg: colors.onPrimary },
  };
  const p = palettes[variant];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      haptic={isDisabled ? null : haptic}
      disabled={isDisabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: s.height,
          borderRadius: s.radius,
          paddingHorizontal: s.px,
          backgroundColor: p.bg,
          gap: s.gap,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {leftIcon}
          <Text variant={s.variant} color={p.fg}>
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
