import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';
import {
  destCoords,
  fetchNearbyStorage,
  formatDistance,
  freshnessLabel,
  submitStorageReport,
  type StorageIssue,
  type StorageKind,
  type StorageSpot,
} from '@/lib/storage';

// 지도는 dev build에서만(rnmapbox는 Expo Go 불가) — 가드 require로 Expo Go에선 리스트만.
const isExpoGo = Constants.appOwnership === 'expo';
let StorageMap: React.ComponentType<{ spots: StorageSpot[]; center: { lat: number; lng: number } }> | null = null;
if (!isExpoGo) {
  try {
    StorageMap = require('../components/StorageMap').default;
  } catch {
    StorageMap = null;
  }
}

const KIND_ICON: Record<StorageKind, keyof typeof Ionicons.glyphMap> = {
  locker: 'cube-outline',
  staffed: 'person-outline',
  shop: 'storefront-outline',
};

const FILTERS: { key: 'all' | StorageKind; labelKey: string }[] = [
  { key: 'all', labelKey: 'storage.filterAll' },
  { key: 'locker', labelKey: 'storage.filterLocker' },
  { key: 'staffed', labelKey: 'storage.filterStaffed' },
];

export default function StorageScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const destination = useTripStore((s) => s.destination);
  const center = destCoords(destination.code);

  const [spots, setSpots] = useState<StorageSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | StorageKind>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!center) {
        setSpots([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetchNearbyStorage(center.lat, center.lng);
      if (!cancelled) {
        setSpots(res);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [center?.lat, center?.lng]);

  const filtered = useMemo(
    () => (filter === 'all' ? spots : spots.filter((s) => s.kind === filter)),
    [spots, filter],
  );

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
          <Text variant="headline">{t('storage.title')}</Text>
          <Text variant="caption" muted>
            {t('storage.subtitle', { city: countryName(destination, locale) })}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {StorageMap && center && filtered.length ? (
        <View style={[styles.mapBox, { backgroundColor: colors.backgroundAlt }]}>
          <StorageMap spots={filtered} center={center} />
        </View>
      ) : null}

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <PressableScale
              key={f.key}
              haptic="selection"
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                { backgroundColor: active ? colors.primary : colors.backgroundAlt },
              ]}>
              <Text variant="footnote" color={active ? 'onPrimary' : 'textSecondary'}>
                {t(f.labelKey)}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={40} color={colors.textTertiary} />
          <Text variant="headline" center style={styles.emptyTitle}>
            {t('storage.empty')}
          </Text>
          <Text variant="callout" muted center>
            {t('storage.emptyDesc')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const ISSUES: { issue: StorageIssue; labelKey: string }[] = [
  { issue: 'closed', labelKey: 'storage.reportClosed' },
  { issue: 'moved', labelKey: 'storage.reportMoved' },
  { issue: 'wrong_price', labelKey: 'storage.reportWrong' },
];

function SpotCard({ spot }: { spot: StorageSpot }) {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const anonId = useTripStore((s) => s.anonId);
  const markSpotReported = useTripStore((s) => s.markSpotReported);
  const alreadyReported = useTripStore((s) => s.reportedSpots.includes(spot.id));
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(alreadyReported);

  const name = locale === 'ko' ? spot.name : spot.name_en ?? spot.name;
  const fresh = freshnessLabel(spot.verified_at, locale);

  const openDirections = () => {
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`);
  };
  const sendReport = (issue: StorageIssue) => {
    setReported(true);
    setReporting(false);
    markSpotReported(spot.id);
    void submitStorageReport({ anonId, spotId: spot.id, issue });
  };

  return (
    <Card style={styles.spot}>
      <View style={styles.spotHead}>
        <View style={[styles.kindIcon, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name={KIND_ICON[spot.kind]} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="caption" muted>
            {t(`storage.kind${spot.kind === 'locker' ? 'Locker' : spot.kind === 'staffed' ? 'Staffed' : 'Shop'}`)}
            {spot.hours ? ` · ${spot.hours}` : ''}
          </Text>
        </View>
        <Text variant="footnote" color="textSecondary">
          {formatDistance(spot.distance_km, locale)}
        </Text>
      </View>

      <View style={styles.spotMeta}>
        {spot.price_text ? (
          <Text variant="footnote" color="textSecondary">
            {spot.price_text}
          </Text>
        ) : null}
        {fresh ? (
          <View style={styles.freshRow}>
            <Ionicons name="checkmark-circle" size={12} color={colors.verdict.success.fg} />
            <Text variant="footnote" color="textTertiary">
              {fresh}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.spotActions, { borderTopColor: colors.borderSubtle }]}>
        <PressableScale haptic="light" onPress={openDirections} style={styles.action}>
          <Ionicons name="navigate-outline" size={15} color={colors.primary} />
          <Text variant="footnote" color="primary">
            {t('storage.directions')}
          </Text>
        </PressableScale>
        {reported ? (
          <Text variant="footnote" color="textTertiary">
            {t('storage.reportThanks')}
          </Text>
        ) : reporting ? (
          <View style={styles.issues}>
            {ISSUES.map((i) => (
              <PressableScale
                key={i.issue}
                haptic="light"
                onPress={() => sendReport(i.issue)}
                style={[styles.issueChip, { backgroundColor: colors.backgroundAlt }]}>
                <Text variant="footnote" color="textSecondary">
                  {t(i.labelKey)}
                </Text>
              </PressableScale>
            ))}
          </View>
        ) : (
          <PressableScale haptic="light" onPress={() => setReporting(true)} style={styles.action} hitSlop={6}>
            <Text variant="footnote" color="textTertiary">
              {t('storage.report')}
            </Text>
          </PressableScale>
        )}
      </View>
    </Card>
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
  mapBox: { height: 220, marginHorizontal: space[5], borderRadius: radius['2xl'], overflow: 'hidden', marginBottom: space[3] },
  filters: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[5], paddingBottom: space[3] },
  filterChip: { paddingVertical: 7, paddingHorizontal: space[4], borderRadius: radius.full },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[8] },
  emptyTitle: { marginTop: space[2] },
  list: { paddingHorizontal: space[5], paddingBottom: space[10], gap: space[3] },
  spot: { gap: space[3] },
  spotHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  kindIcon: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  freshRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  issues: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], justifyContent: 'flex-end' },
  issueChip: { paddingVertical: 4, paddingHorizontal: space[3], borderRadius: radius.full },
  flex: { flex: 1 },
});
