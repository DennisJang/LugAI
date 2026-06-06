import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Chip, Divider, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { space, useTheme, type VerdictKey } from '@/design';
import { type Localized, pick, useLocale, useT } from '@/lib/i18n';

const CATEGORIES: Localized[] = [
  { ko: '전체', en: 'All' },
  { ko: '액체', en: 'Liquids' },
  { ko: '배터리', en: 'Batteries' },
  { ko: '식품', en: 'Food' },
  { ko: '날붙이', en: 'Blades' },
  { ko: '세관', en: 'Customs' },
];

const CASES: { emoji: string; title: Localized; place: Localized; verdict: VerdictKey; tag: Localized }[] = [
  {
    emoji: '🧴',
    title: { ko: '면세 향수 3개, 환승에서 압수', en: 'Three duty-free perfumes seized at transfer' },
    place: { ko: '🇫🇷 파리 경유', en: '🇫🇷 Paris transfer' },
    verdict: 'danger',
    tag: { ko: '액체', en: 'Liquids' },
  },
  {
    emoji: '🔋',
    title: { ko: '보조배터리 2개째는 회수당해요', en: 'A second power bank gets taken' },
    place: { ko: '🇯🇵 도쿄', en: '🇯🇵 Tokyo' },
    verdict: 'warning',
    tag: { ko: '배터리', en: 'Battery' },
  },
  {
    emoji: '🥩',
    title: { ko: '육포 반입하다 검역 벌금 $300', en: '$300 quarantine fine for beef jerky' },
    place: { ko: '🇦🇺 시드니', en: '🇦🇺 Sydney' },
    verdict: 'danger',
    tag: { ko: '식품', en: 'Food' },
  },
  {
    emoji: '💨',
    title: { ko: '전자담배 반입하다 태국서 구금', en: 'Detained in Thailand for a vape' },
    place: { ko: '🇹🇭 방콕', en: '🇹🇭 Bangkok' },
    verdict: 'danger',
    tag: { ko: '세관', en: 'Customs' },
  },
];

const RULE_COUNTRIES: { code: string; flag: string; name: Localized; rule: Localized }[] = [
  { code: 'JP', flag: '🇯🇵', name: { ko: '일본', en: 'Japan' }, rule: { ko: '육류·면세 액체 주의', en: 'Meat & duty-free liquids' } },
  { code: 'US', flag: '🇺🇸', name: { ko: '미국', en: 'United States' }, rule: { ko: 'TSA 3-1-1 룰', en: 'TSA 3-1-1 rule' } },
  { code: 'AU', flag: '🇦🇺', name: { ko: '호주', en: 'Australia' }, rule: { ko: '검역 매우 엄격', en: 'Very strict quarantine' } },
  { code: 'TH', flag: '🇹🇭', name: { ko: '태국', en: 'Thailand' }, rule: { ko: '전자담배 반입 금지', en: 'Vapes banned' } },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">{t('explore.title')}</Text>
        <Text variant="callout" muted>
          {t('explore.subtitle')}
        </Text>
      </View>

      <Card style={[styles.featured, { backgroundColor: colors.primaryTint }]}>
        <View style={styles.featuredTop}>
          <View style={[styles.tag, { backgroundColor: colors.surface }]}>
            <Text variant="footnote" color="primary">
              {t('explore.weekly')}
            </Text>
          </View>
          <Text style={styles.featuredEmoji}>🧳</Text>
        </View>
        <Text variant="title3">{t('explore.featuredTitle')}</Text>
        <Text variant="callout" muted>
          {t('explore.featuredDesc')}
        </Text>
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}>
        {CATEGORIES.map((c, i) => (
          <Chip key={c.en} label={pick(c, locale)} active={i === 0} />
        ))}
      </ScrollView>

      <Text variant="headline" style={styles.sectionTitle}>
        {t('explore.casesTitle')}
      </Text>
      <View style={styles.caseList}>
        {CASES.map((c) => (
          <PressableScale key={c.title.en} haptic="light" pressScale={0.98}>
            <Card style={styles.caseCard}>
              <Text style={styles.caseEmoji}>{c.emoji}</Text>
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {pick(c.title, locale)}
                </Text>
                <Text variant="caption" muted style={styles.casePlace}>
                  {pick(c.place, locale)}
                </Text>
              </View>
              <VerdictBadge verdict={c.verdict} label={pick(c.tag, locale)} size="sm" />
            </Card>
          </PressableScale>
        ))}
      </View>

      <Text variant="headline" style={styles.sectionTitle}>
        {t('explore.countriesTitle')}
      </Text>
      <Card padding={0}>
        {RULE_COUNTRIES.map((c, i) => (
          <View key={c.code}>
            {i > 0 && <Divider inset={space[5] + 30 + space[3]} />}
            <PressableScale
              haptic="light"
              pressScale={0.98}
              onPress={() => router.push({ pathname: '/rules/[code]', params: { code: c.code } })}>
              <View style={styles.countryRow}>
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <View style={styles.flex}>
                  <Text variant="body">{pick(c.name, locale)}</Text>
                  <Text variant="caption" muted>
                    {pick(c.rule, locale)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </PressableScale>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space[2], gap: 4, marginBottom: space[5] },
  featured: { gap: space[2], marginBottom: space[5] },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingVertical: 5, paddingHorizontal: space[3], borderRadius: 999 },
  featuredEmoji: { fontSize: 30 },
  chipScroll: { marginHorizontal: -space[5], marginBottom: space[6] },
  chips: { gap: space[2], paddingHorizontal: space[5] },
  sectionTitle: { marginBottom: space[3], marginLeft: space[1] },
  caseList: { gap: space[2], marginBottom: space[6] },
  caseCard: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
  caseEmoji: { fontSize: 26 },
  casePlace: { marginTop: 2 },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], paddingHorizontal: space[5] },
  countryFlag: { fontSize: 30 },
  flex: { flex: 1 },
});
