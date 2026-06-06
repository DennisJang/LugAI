import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { groupByVerdict } from '@/lib/mockScan';
import { useTripStore, type Trip } from '@/lib/store';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

export default function TripsScreen() {
  const { colors } = useTheme();
  const trips = useTripStore((s) => s.trips);
  const hasHydrated = useTripStore((s) => s.hasHydrated);
  const removeTrip = useTripStore((s) => s.removeTrip);

  const confirmDelete = (t: Trip) => {
    Alert.alert('여행 삭제', `'${t.destination.name}' 기록을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeTrip(t.id) },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">내 여행</Text>
        <PressableScale
          haptic="medium"
          pressScale={0.92}
          onPress={() => router.push('/scan')}
          accessibilityLabel="새 스캔"
          style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color={colors.onPrimary} />
        </PressableScale>
      </View>

      {hasHydrated && trips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emoji}>✈️</Text>
          <Text variant="headline">아직 저장된 여행이 없어요</Text>
          <Text variant="callout" muted center>
            짐을 스캔하고 저장하면{'\n'}여기에 기록돼요
          </Text>
          <View style={styles.emptyCta}>
            <Button
              label="짐 스캔하기"
              size="md"
              fullWidth={false}
              leftIcon={<Ionicons name="scan" size={18} color={colors.onPrimary} />}
              onPress={() => router.push('/scan')}
            />
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {trips.map((t) => {
            const g = groupByVerdict(t.items);
            return (
              <PressableScale
                key={t.id}
                haptic="light"
                pressScale={0.98}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
                onLongPress={() => confirmDelete(t)}
                accessibilityLabel={`${t.destination.name} 여행 상세`}>
                <Card style={styles.tripCard}>
                  <View style={styles.tripTop}>
                    <Text style={styles.flag}>{t.destination.flag}</Text>
                    <View style={styles.flex}>
                      <Text variant="title3">{t.destination.name}</Text>
                      <Text variant="caption" muted>
                        {fmtDate(t.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.summary, { borderTopColor: colors.borderSubtle }]}>
                    <Stat n={t.items.length} label="물품" />
                    <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                    <Stat
                      n={g.warning.length}
                      label="주의"
                      tone={g.warning.length ? colors.verdict.warning.fg : undefined}
                    />
                    <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                    <Stat
                      n={g.danger.length}
                      label="확인"
                      tone={g.danger.length ? colors.verdict.danger.fg : undefined}
                    />
                  </View>
                </Card>
              </PressableScale>
            );
          })}
          <Text variant="caption" color="textTertiary" center style={styles.hint}>
            카드를 길게 누르면 삭제할 수 있어요
          </Text>
        </View>
      )}
    </Screen>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone?: string }) {
  return (
    <View style={styles.statItem}>
      <Text variant="title3" color={tone}>
        {n}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingTop: space[16] },
  emoji: { fontSize: 44, marginBottom: space[1] },
  emptyCta: { marginTop: space[5] },
  list: { gap: space[3] },
  tripCard: { gap: space[4] },
  tripTop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  flag: { fontSize: 34 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space[4],
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  vline: { width: StyleSheet.hairlineWidth, height: 28 },
  hint: { marginTop: space[6] },
  flex: { flex: 1 },
});
