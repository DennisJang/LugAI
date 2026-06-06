import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, Chip, Divider, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { COUNTRIES, countryName, findCountry, POPULAR_CODES, type Country } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';

export default function DestinationScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const destination = useTripStore((s) => s.destination);
  const setDestination = useTripStore((s) => s.setDestination);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.includes(query.trim()) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query]);

  const popular = POPULAR_CODES.map(findCountry).filter(Boolean) as Country[];

  const select = (c: Country) => {
    setDestination(c);
    router.back();
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={styles.header}>
        <Text variant="title2">{t('dest.title')}</Text>
        <PressableScale
          haptic="light"
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel={t('common.close')}
          style={[styles.closeBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </PressableScale>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.search, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('dest.search')}
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {!query && (
          <>
            <Text variant="footnote" color="textTertiary" style={styles.sectionLabel}>
              {t('dest.popular')}
            </Text>
            <View style={styles.popular}>
              {popular.map((c) => (
                <Chip
                  key={c.code}
                  label={`${c.flag} ${countryName(c, locale)}`}
                  active={c.code === destination.code}
                  onPress={() => select(c)}
                />
              ))}
            </View>
          </>
        )}

        <Text variant="footnote" color="textTertiary" style={styles.sectionLabel}>
          {query ? t('dest.results') : t('dest.all')}
        </Text>
        <Card padding={0}>
          {filtered.map((c, i) => (
            <View key={c.code}>
              {i > 0 && <Divider inset={space[5] + 30 + space[3]} />}
              <PressableScale haptic="light" pressScale={0.98} onPress={() => select(c)}>
                <View style={styles.countryRow}>
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text variant="body" style={styles.flex}>
                    {countryName(c, locale)}
                  </Text>
                  {c.code === destination.code && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </View>
              </PressableScale>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyRow}>
              <Text variant="callout" color="textTertiary">
                {t('dest.noResults')}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[4],
  },
  closeBtn: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: space[5], marginBottom: space[4] },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    height: 48,
    borderRadius: radius.lg,
  },
  searchInput: { flex: 1, fontSize: 16 },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[12] },
  sectionLabel: { marginBottom: space[2], marginLeft: space[2], textTransform: 'uppercase' },
  popular: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginBottom: space[6] },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[5],
  },
  flag: { fontSize: 30 },
  emptyRow: { padding: space[6], alignItems: 'center' },
  flex: { flex: 1 },
});
