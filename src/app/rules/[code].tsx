import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { countryName, findCountry } from '@/lib/countries';
import { type Locale, pick, useLocale, useT } from '@/lib/i18n';
import { BASELINE, countryNotes, type CountryNote, type RegRule } from '@/lib/regulations';

export default function RulesScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { code } = useLocalSearchParams<{ code: string }>();
  const country = findCountry(code ?? '');
  const name = country ? countryName(country, locale) : (code ?? '');
  const notes = countryNotes(code ?? '');

  return (
    <Screen edges={['top']} padded={false}>
      <View style={styles.header}>
        <PressableScale
          haptic="light"
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel={t('common.back')}
          style={[styles.back, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text variant="headline" numberOfLines={1}>
          {country?.flag ?? '🌍'} {name}
        </Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {notes.length > 0 && (
          <>
            <Text variant="headline" style={styles.sectionTitle}>
              {t('rules.specific', { country: name })}
            </Text>
            <View style={styles.list}>
              {notes.map((n, i) => (
                <NoteCard key={i} note={n} locale={locale} />
              ))}
            </View>
          </>
        )}

        <Text variant="headline" style={styles.sectionTitle}>
          {t('rules.general')}
        </Text>
        <View style={styles.list}>
          {BASELINE.map((r) => (
            <RuleCard key={r.id} rule={r} locale={locale} sourceLabel={t('common.source')} />
          ))}
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text variant="footnote" color="textTertiary" style={styles.flex}>
            {t('result.disclaimer')}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function RuleCard({ rule, locale, sourceLabel }: { rule: RegRule; locale: Locale; sourceLabel: string }) {
  return (
    <Card>
      <View style={styles.ruleTop}>
        <Text style={styles.emoji}>{rule.emoji}</Text>
        <Text variant="bodyStrong" style={styles.flex}>
          {pick(rule.title, locale)}
        </Text>
        <VerdictBadge verdict={rule.verdict} label={pick(rule.badge, locale)} size="sm" />
      </View>
      <Text variant="callout" color="textSecondary" style={styles.ruleDetail}>
        {pick(rule.detail, locale)}
      </Text>
      <Text variant="footnote" color="textTertiary">
        {sourceLabel} · {rule.source}
      </Text>
    </Card>
  );
}

function NoteCard({ note, locale }: { note: CountryNote; locale: Locale }) {
  const { colors } = useTheme();
  return (
    <Card>
      <View style={styles.ruleTop}>
        <View style={[styles.dot, { backgroundColor: colors.verdict[note.verdict].solid }]} />
        <Text variant="bodyStrong" style={styles.flex}>
          {pick(note.title, locale)}
        </Text>
      </View>
      <Text variant="callout" color="textSecondary" style={styles.ruleDetail}>
        {pick(note.body, locale)}
      </Text>
      <Text variant="footnote" color="textTertiary">
        {note.source}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  back: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[12] },
  sectionTitle: { marginBottom: space[3], marginTop: space[2], marginLeft: space[1] },
  list: { gap: space[2], marginBottom: space[4] },
  ruleTop: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2] },
  emoji: { fontSize: 24 },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  ruleDetail: { marginBottom: space[2], lineHeight: 21 },
  disclaimer: { flexDirection: 'row', gap: space[2], padding: space[3], borderRadius: radius.md, marginTop: space[2] },
  flex: { flex: 1 },
});
