import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '@/design';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface RowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  sublabel?: string;
  value?: string;
  trailing?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}

/** 설정/목록용 행 — 아이콘 칩 + 라벨(+서브) + 값/트레일링 + 셰브론. */
export function Row({
  icon,
  iconColor,
  label,
  sublabel,
  value,
  trailing,
  showChevron = true,
  onPress,
}: RowProps) {
  const { colors } = useTheme();

  const content = (
    <View style={styles.row}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name={icon} size={18} color={iconColor ?? colors.textSecondary} />
        </View>
      )}
      <View style={styles.labels}>
        <Text variant="body">{label}</Text>
        {sublabel ? (
          <Text variant="caption" muted>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="callout" muted>
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale haptic="light" pressScale={0.98} onPress={onPress}>
        {content}
      </PressableScale>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[5],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: { flex: 1, gap: 1 },
});
