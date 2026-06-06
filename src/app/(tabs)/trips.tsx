import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';

const TRIPS = [
  { flag: '🇯🇵', name: '도쿄 여행', dates: '2026.02.10 – 02.14', items: 23, warn: 3, block: 1, upcoming: true },
  { flag: '🇻🇳', name: '다낭 여행', dates: '2025.12.01 – 12.07', items: 15, warn: 0, block: 0, upcoming: false },
];

export default function TripsScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">내 여행</Text>
        <PressableScale
          haptic="medium"
          pressScale={0.92}
          onPress={() => router.push('/scan')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color={colors.onPrimary} />
        </PressableScale>
      </View>

      <View style={styles.list}>
        {TRIPS.map((t) => (
          <PressableScale key={t.name} haptic="light" pressScale={0.98}>
            <Card style={styles.tripCard}>
              <View style={styles.tripTop}>
                <Text style={styles.flag}>{t.flag}</Text>
                <View style={styles.flex}>
                  <Text variant="title3">{t.name}</Text>
                  <Text variant="caption" muted>
                    {t.dates}
                  </Text>
                </View>
                {t.upcoming && (
                  <View style={[styles.pill, { backgroundColor: colors.primaryTint }]}>
                    <Text variant="footnote" color="primary">
                      예정
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.summary, { borderTopColor: colors.borderSubtle }]}>
                <TripStat label="물품" value={`${t.items}`} />
                <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                <TripStat label="주의" value={`${t.warn}`} tone={t.warn ? colors.verdict.warning.fg : undefined} />
                <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                <TripStat label="금지" value={`${t.block}`} tone={t.block ? colors.verdict.danger.fg : undefined} />
              </View>
            </Card>
          </PressableScale>
        ))}
      </View>

      <Text variant="caption" color="textTertiary" center style={styles.hint}>
        FAB로 짐을 스캔하면 여행이 자동 기록돼요
      </Text>
    </Screen>
  );
}

function TripStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={styles.statItem}>
      <Text variant="title3" color={tone}>
        {value}
      </Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space[2],
    marginBottom: space[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  list: { gap: space[3] },
  tripCard: { gap: space[4] },
  tripTop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  flag: { fontSize: 34 },
  pill: { paddingVertical: 5, paddingHorizontal: space[3], borderRadius: radius.full },
  summary: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space[4] },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  vline: { width: StyleSheet.hairlineWidth, height: 28 },
  hint: { marginTop: space[6] },
  flex: { flex: 1 },
});
