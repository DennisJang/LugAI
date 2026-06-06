import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useT } from '@/lib/i18n';
import { useOnline } from '@/lib/useOnline';

/** 오프라인일 때만 보이는 안내 배너. */
export function OfflineBanner() {
  const { colors } = useTheme();
  const t = useT();
  const online = useOnline();
  if (online) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.verdict.warning.bg }]}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.verdict.warning.fg} />
      <Text variant="caption" color={colors.verdict.warning.fg} style={styles.flex}>
        {t('common.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    marginBottom: space[4],
  },
  flex: { flex: 1 },
});
