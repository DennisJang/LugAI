import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { press, spring } from '@/design';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection';

function triggerHaptic(style: HapticStyle) {
  switch (style) {
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'heavy':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case 'selection':
      return Haptics.selectionAsync();
  }
}

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  /** 누름 시 축소 스케일 (기본 0.97) */
  pressScale?: number;
  /** 햅틱 피드백 (기본 'light', null이면 끔) */
  haptic?: HapticStyle | null;
  style?: StyleProp<ViewStyle>;
}

/** 누르면 스프링으로 축소 + 햅틱을 주는 베이스 터치 요소. */
export function PressableScale({
  children,
  pressScale = press.scale,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  style,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      scale.value = withSpring(pressScale, spring.snappy);
      onPressIn?.(e);
    },
    [onPressIn, pressScale, scale],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      scale.value = withSpring(1, spring.default);
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (haptic && !disabled) triggerHaptic(haptic);
      onPress?.(e);
    },
    [haptic, disabled, onPress],
  );

  return (
    <AnimatedPressableBase
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      style={[animatedStyle, style]}
      {...rest}>
      {children}
    </AnimatedPressableBase>
  );
}
