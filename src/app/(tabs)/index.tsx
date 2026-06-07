import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';
import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { countryName, findCountry } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';
import { fetchUpcomingTrip, formatTripDates } from '@/lib/trips';

export default function HomeScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const anonId = useTripStore((s) => s.anonId);
  const destination = useTripStore((s) => s.destination);
  const upcomingTrip = useTripStore((s) => s.upcomingTrip);
  const setUpcomingTrip = useTripStore((s) => s.setUpcomingTrip);
  const setDestination = useTripStore((s) => s.setDestination);
  const destName = countryName(destination, locale);

  const hasTrip = !!upcomingTrip && upcomingTrip.destCode === destination.code;
  const tripDates = hasTrip ? formatTripDates(upcomingTrip.startDate, upcomingTrip.endDate, locale) : '';

  // 예매에서 자동 수신된 다가오는 여행이 있으면 도착지 자동 설정(graceful: 미연동 시 무동작).
  // 단, 사용자가 수동으로 도착지를 바꿔 둔 경우 새 예매가 아닌 한 그 선택을 덮어쓰지 않는다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const trip = await fetchUpcomingTrip(anonId);
      if (cancelled || !trip) return;
      const country = findCountry(trip.destCode);
      if (!country) return;
      const { upcomingTrip: prev, destination: cur } = useTripStore.getState();
      setUpcomingTrip(trip);
      const isNewTrip = !prev || prev.destCode !== trip.destCode;
      const onSyncedDest = !prev || cur.code === prev.destCode;
      if (isNewTrip || onSyncedDest) setDestination(country);
    })();
    return () => {
      cancelled = true;
    };
  }, [anonId, setUpcomingTrip, setDestination]);

  return (
    <Screen scroll>
      <OfflineBanner />
      <View style={styles.greeting}>
        <Text variant="subhead" muted>
          {t('home.greeting')}
        </Text>
        <Text variant="title1">{t('home.title')}</Text>
      </View>

      <PressableScale haptic="light" onPress={() => router.push('/destination')} style={styles.destBlock}>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.flag}>{destination.flag}</Text>
              <View style={styles.gap2}>
                <Text variant="caption" muted>
                  {hasTrip ? t('home.upcoming') : t('home.destination')}
                </Text>
                <Text variant="title3">{destName}</Text>
                {hasTrip && tripDates ? (
                  <Text variant="footnote" color="textTertiary">
                    {tripDates}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.changeChip, { backgroundColor: colors.backgroundAlt }]}>
              <Text variant="footnote" color="textSecondary">
                {t('home.change')}
              </Text>
              <Ionicons name="chevron-forward" size={13} color={colors.textTertiary} />
            </View>
          </View>
        </Card>
      </PressableScale>

      <Card bordered={false} style={[styles.heroCard, { backgroundColor: colors.primaryTint }]}>
        <View style={[styles.scanIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="scan" size={32} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text variant="title3" center>
            {t('home.heroTitle')}
          </Text>
          <Text variant="callout" muted center>
            {t('home.heroDesc', { country: destName })}
          </Text>
        </View>
        <Button
          label={t('home.startScan')}
          leftIcon={<Ionicons name="camera" size={20} color={colors.onPrimary} />}
          onPress={() => router.push('/scan')}
        />
      </Card>

      <PressableScale haptic="light" onPress={() => router.push('/storage')} style={styles.storageBlock}>
        <Card style={styles.storageRow}>
          <View style={[styles.storageIcon, { backgroundColor: colors.backgroundAlt }]}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text variant="bodyStrong">{t('storage.homeTitle')}</Text>
            <Text variant="caption" muted>
              {t('storage.homeDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Card>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { paddingTop: space[2], gap: 2, marginBottom: space[6] },
  destBlock: { marginBottom: space[5] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  gap2: { gap: 2 },
  flag: { fontSize: 34 },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 7,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
  },
  heroCard: { alignItems: 'center', paddingVertical: space[8], gap: space[4], marginBottom: space[5] },
  scanIcon: { width: 72, height: 72, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  heroText: { gap: space[1], alignItems: 'center' },
  storageBlock: {},
  storageRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  storageIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
