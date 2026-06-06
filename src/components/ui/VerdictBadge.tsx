import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme, type VerdictKey } from '@/design';

import { Text } from './Text';

const ICON: Record<VerdictKey, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  warning: 'alert-circle',
  danger: 'close-circle',
  info: 'information-circle',
};

export interface VerdictBadgeProps {
  verdict: VerdictKey;
  label: string;
  size?: 'sm' | 'md';
}

/** ✅⚠️❌ 판정 뱃지 — 색은 4종으로 절제, 뉘앙스는 라벨로 표현. */
export function VerdictBadge({ verdict, label, size = 'md' }: VerdictBadgeProps) {
  const { colors } = useTheme();
  const v = colors.verdict[verdict];
  const compact = size === 'sm';
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: compact ? 4 : 6,
          paddingHorizontal: compact ? space[2] : space[3],
          gap: compact ? 4 : space[1],
        },
      ]}>
      <Ionicons name={ICON[verdict]} size={compact ? 14 : 16} color={v.fg} />
      <Text variant={compact ? 'caption' : 'subhead'} color={v.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
  },
});
