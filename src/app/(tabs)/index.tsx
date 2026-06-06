import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { radius, space, useTheme, type VerdictKey } from '@/design';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';

export default function HomeScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const destination = useTripStore((s) => s.destination);
  const destName = countryName(destination, locale);

  const examples: { emoji: string; name: string; verdict: VerdictKey; label: string }[] = [
    { emoji: '🔋', name: t('home.ex1'), verdict: 'warning', label: t('home.ex1Badge') },
    { emoji: '💧', name: t('home.ex2'), verdict: 'danger', label: t('home.ex2Badge') },
    { emoji: '✂️', name: t('home.ex3'), verdict: 'success', label: t('home.ex3Badge') },
  ];

  return (
    <Screen scroll>
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
                  {t('home.destination')}
                </Text>
                <Text variant="title3">{destName}</Text>
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

      <Text variant="headline" style={styles.sectionTitle}>
        {t('home.examplesTitle')}
      </Text>
      <Card padding={0} style={styles.exampleGroup}>
        {examples.map((it, i) => (
          <View key={it.name}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
            <View style={styles.exampleRow}>
              <Text style={styles.exampleEmoji}>{it.emoji}</Text>
              <Text variant="body" style={styles.flex}>
                {it.name}
              </Text>
              <VerdictBadge verdict={it.verdict} label={it.label} size="sm" />
            </View>
          </View>
        ))}
      </Card>

      <PressableScale haptic="light" onPress={() => router.push('/discover')}>
        <Card style={styles.teaser}>
          <Text style={styles.teaserEmoji}>🧳</Text>
          <View style={styles.flex}>
            <Text variant="bodyStrong">{t('home.teaserTitle')}</Text>
            <Text variant="caption" muted>
              {t('home.teaserDesc')}
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
  heroCard: { marginBottom: space[7], alignItems: 'center', paddingVertical: space[8], gap: space[4] },
  scanIcon: { width: 72, height: 72, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  heroText: { gap: space[1], alignItems: 'center' },
  sectionTitle: { marginBottom: space[3], marginLeft: space[1] },
  exampleGroup: { marginBottom: space[7] },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[4],
    paddingHorizontal: space[5],
  },
  exampleEmoji: { fontSize: 24 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: space[5] + 24 + space[3] },
  teaser: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  teaserEmoji: { fontSize: 28 },
  flex: { flex: 1 },
});
