import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
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
  const t = useT();
  const locale = useLocale();
  const trips = useTripStore((s) => s.trips);
  const hasHydrated = useTripStore((s) => s.hasHydrated);
  const removeTrip = useTripStore((s) => s.removeTrip);

  const confirmDelete = (trip: Trip) => {
    Alert.alert(t('trips.deleteTitle'), t('trips.deleteMsg', { name: countryName(trip.destination, locale) }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeTrip(trip.id) },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">{t('trips.title')}</Text>
        <PressableScale
          haptic="medium"
          pressScale={0.92}
          onPress={() => router.push('/scan')}
          accessibilityLabel={t('tab.scan')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color={colors.onPrimary} />
        </PressableScale>
      </View>

      {hasHydrated && trips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emoji}>✈️</Text>
          <Text variant="headline">{t('trips.emptyTitle')}</Text>
          <Text variant="callout" muted center>
            {t('trips.emptyDesc')}
          </Text>
          <View style={styles.emptyCta}>
            <Button
              label={t('trips.scanCta')}
              size="md"
              fullWidth={false}
              leftIcon={<Ionicons name="scan" size={18} color={colors.onPrimary} />}
              onPress={() => router.push('/scan')}
            />
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {trips.map((trip) => {
            const g = groupByVerdict(trip.items);
            return (
              <PressableScale
                key={trip.id}
                haptic="light"
                pressScale={0.98}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } })}
                onLongPress={() => confirmDelete(trip)}
                accessibilityLabel={countryName(trip.destination, locale)}>
                <Card style={styles.tripCard}>
                  <View style={styles.tripTop}>
                    <Text style={styles.flag}>{trip.destination.flag}</Text>
                    <View style={styles.flex}>
                      <Text variant="title3">{countryName(trip.destination, locale)}</Text>
                      <Text variant="caption" muted>
                        {fmtDate(trip.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.summary, { borderTopColor: colors.borderSubtle }]}>
                    <Stat n={trip.items.length} label={t('trips.items')} />
                    <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                    <Stat
                      n={g.warning.length}
                      label={t('trips.caution')}
                      tone={g.warning.length ? colors.verdict.warning.fg : undefined}
                    />
                    <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
                    <Stat
                      n={g.danger.length}
                      label={t('trips.check')}
                      tone={g.danger.length ? colors.verdict.danger.fg : undefined}
                    />
                  </View>
                </Card>
              </PressableScale>
            );
          })}
          <Text variant="caption" color="textTertiary" center style={styles.hint}>
            {t('trips.hint')}
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
  summary: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space[4] },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  vline: { width: StyleSheet.hairlineWidth, height: 28 },
  hint: { marginTop: space[6] },
  flex: { flex: 1 },
});
