import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ScanResultView } from '@/components/ScanResultView';
import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';

export default function TripDetailScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTripStore((s) => s.trips.find((tr) => tr.id === id));
  const removeTrip = useTripStore((s) => s.removeTrip);

  if (!trip) {
    return (
      <Screen edges={['top']}>
        <View style={styles.fallback}>
          <Text variant="headline">{t('trip.notFound')}</Text>
          <Button label={t('common.back')} size="md" fullWidth={false} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const name = countryName(trip.destination, locale);

  const confirmDelete = () => {
    Alert.alert(t('trips.deleteTitle'), t('trips.deleteMsg', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeTrip(trip.id);
          router.back();
        },
      },
    ]);
  };

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
        <Text variant="headline" numberOfLines={1}>
          {trip.destination.flag} {name}
        </Text>
        <PressableScale
          haptic="light"
          onPress={confirmDelete}
          hitSlop={12}
          accessibilityLabel={t('trip.delete')}
          style={[styles.iconBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="trash-outline" size={18} color={colors.verdict.danger.fg} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScanResultView scan={{ destination: trip.destination, items: trip.items, scannedAt: trip.createdAt }} />

        <PressableScale
          haptic="light"
          onPress={() => router.push({ pathname: '/claim/[id]', params: { id: trip.id } })}
          style={styles.claimEntry}>
          <Card style={styles.claimRow}>
            <View style={[styles.claimIcon, { backgroundColor: colors.backgroundAlt }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{t('claim.entry')}</Text>
              <Text variant="caption" muted>
                {t('claim.entryDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  iconBtn: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[12] },
  claimEntry: { marginTop: space[2] },
  claimRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  claimIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
