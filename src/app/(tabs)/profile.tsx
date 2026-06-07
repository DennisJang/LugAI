import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Divider, Row, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { type Locale, useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';

const ROW_INSET = space[5] + 34 + space[3];
const LOCALE_CYCLE: Locale[] = ['ko', 'en', 'ja', 'zh'];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const setLocale = useTripStore((s) => s.setLocale);
  const units = useTripStore((s) => s.units);
  const setUnits = useTripStore((s) => s.setUnits);
  const trips = useTripStore((s) => s.trips);
  const itemCount = trips.reduce((n, trip) => n + trip.items.length, 0);
  const countryCount = new Set(trips.map((trip) => trip.destination.code)).size;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">{t('profile.title')}</Text>
      </View>

      <Card style={styles.account}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="person" size={28} color={colors.textTertiary} />
        </View>
        <View style={styles.flex}>
          <Text variant="title3">{t('profile.guest')}</Text>
          <Text variant="caption" muted>
            {t('profile.guestDesc')}
          </Text>
        </View>
      </Card>

      <View style={styles.stats}>
        <Card style={styles.statTile}>
          <Text variant="title1">{itemCount}</Text>
          <Text variant="caption" muted>
            {t('profile.statItems')}
          </Text>
        </Card>
        <Card style={styles.statTile}>
          <Text variant="title1">{countryCount}</Text>
          <Text variant="caption" muted>
            {t('profile.statCountries')}
          </Text>
        </Card>
      </View>

      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        {t('profile.travel')}
      </Text>
      <Card padding={0}>
        <Row icon="albums-outline" label={t('library.entry')} onPress={() => router.push('/library')} />
        <Divider inset={ROW_INSET} />
        <Row icon="link-outline" label={t('profile.connect')} onPress={() => router.push('/connect')} />
      </Card>

      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        {t('profile.settings')}
      </Text>
      <Card padding={0}>
        <Row
          icon="options-outline"
          label={t('profile.units')}
          value={units === 'imperial' ? 'oz · in' : 'ml · cm'}
          onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
        />
        <Divider inset={ROW_INSET} />
        <Row
          icon="language-outline"
          label={t('profile.language')}
          value={t('profile.langName')}
          onPress={() => setLocale(LOCALE_CYCLE[(LOCALE_CYCLE.indexOf(locale) + 1) % LOCALE_CYCLE.length])}
        />
      </Card>

      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        {t('profile.about')}
      </Text>
      <Card padding={0}>
        <Row icon="shield-checkmark-outline" label={t('profile.privacy')} onPress={() => router.push('/legal/privacy')} />
        <Divider inset={ROW_INSET} />
        <Row icon="document-text-outline" label={t('profile.terms')} onPress={() => router.push('/legal/terms')} />
        <Divider inset={ROW_INSET} />
        <Row icon="information-circle-outline" label={t('profile.version')} value="1.0.0" showChevron={false} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space[2], marginBottom: space[5] },
  account: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  avatar: { width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: space[3], marginTop: space[6] },
  statTile: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space[5] },
  groupTitle: { marginTop: space[6], marginBottom: space[2], marginLeft: space[3], textTransform: 'uppercase' },
  flex: { flex: 1 },
});
