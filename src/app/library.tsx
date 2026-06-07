import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useT } from '@/lib/i18n';
import { buildLibrary } from '@/lib/library';
import { useTripStore } from '@/lib/store';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const t = useT();
  const trips = useTripStore((s) => s.trips);
  const items = useMemo(() => buildLibrary(trips), [trips]);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={styles.topBar}>
        <PressableScale
          haptic="light"
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel={t('common.back')}
          style={[styles.iconBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.titleWrap}>
          <Text variant="headline">{t('library.title')}</Text>
          <Text variant="caption" muted>
            {t('library.subtitle', { n: items.length })}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="albums-outline" size={40} color={colors.textTertiary} />
          <Text variant="headline" center style={styles.emptyTitle}>
            {t('library.empty')}
          </Text>
          <Text variant="callout" muted center>
            {t('library.emptyDesc')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card padding={0}>
            {items.map((it, i) => (
              <View key={it.key}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
                <View style={styles.row}>
                  <Text style={styles.emoji}>{it.emoji}</Text>
                  <Text variant="body" style={styles.flex} numberOfLines={1}>
                    {it.name}
                  </Text>
                  <View style={[styles.dot, { backgroundColor: colors.verdict[it.verdict].solid }]} />
                  <Text variant="footnote" color="textTertiary">
                    {t('library.count', { n: it.count })}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  iconBtn: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, gap: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[8] },
  emptyTitle: { marginTop: space[2] },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[10] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], paddingHorizontal: space[4] },
  emoji: { fontSize: 24 },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: space[4] + 24 + space[3] },
  flex: { flex: 1 },
});
