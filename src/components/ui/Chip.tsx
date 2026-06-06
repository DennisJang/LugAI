import { StyleSheet } from 'react-native';

import { radius, space, useTheme } from '@/design';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** 카테고리/필터 칩 — 회색 캔버스 위 화이트(비활성) / 브랜드(활성). */
export function Chip({ label, active = false, onPress }: ChipProps) {
  const { colors } = useTheme();
  return (
    <PressableScale
      haptic="selection"
      pressScale={0.94}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface }]}>
      <Text variant="subhead" color={active ? 'onPrimary' : 'textSecondary'}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.full,
  },
});
