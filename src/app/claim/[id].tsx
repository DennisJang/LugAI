import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { buildClaimText, claimTotal, EMPTY_DRAFT, isIncluded, type ClaimLabels } from '@/lib/claim';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { useTripStore, type ClaimDraft } from '@/lib/store';

export default function ClaimScreen() {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTripStore((s) => s.trips.find((tr) => tr.id === id));
  const setClaimDraft = useTripStore((s) => s.setClaimDraft);

  const [draft, setDraft] = useState<ClaimDraft>(() => useTripStore.getState().claimDrafts[id] ?? EMPTY_DRAFT);
  useEffect(() => {
    if (!id) return;
    const empty =
      !draft.airline &&
      !draft.flightNo &&
      !draft.bagTag &&
      !draft.lostDate &&
      Object.keys(draft.values).length === 0 &&
      draft.excluded.length === 0;
    // 빈 초안을 새로 만들지 않음(스토리지 부풀림 방지). 내용이 있거나 기존 초안이 있을 때만 저장.
    if (empty && !useTripStore.getState().claimDrafts[id]) return;
    setClaimDraft(id, draft);
  }, [draft, id, setClaimDraft]);

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

  const destName = countryName(trip.destination, locale);
  const total = claimTotal(draft, trip.items);

  const toggle = (itemId: string) =>
    setDraft((d) => ({
      ...d,
      excluded: d.excluded.includes(itemId) ? d.excluded.filter((x) => x !== itemId) : [...d.excluded, itemId],
    }));
  const setValue = (itemId: string, text: string) => {
    const n = Number(text.replace(/[^\d]/g, ''));
    setDraft((d) => {
      const values = { ...d.values };
      if (n > 0) values[itemId] = n;
      else delete values[itemId];
      return { ...d, values };
    });
  };

  const onShare = () => {
    const labels: ClaimLabels = {
      title: t('claim.shareTitle'),
      airline: t('claim.airline'),
      flightNo: t('claim.flightNo'),
      bagTag: t('claim.bagTag'),
      lostDate: t('claim.lostDate'),
      destination: t('home.destination'),
      items: t('trips.items'),
      total: t('claim.total'),
      disclaimer: t('claim.disclaimer'),
    };
    void Share.share({ message: buildClaimText({ destinationName: destName, draft, items: trip.items, labels }) });
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
        <Text variant="headline">{t('claim.title')}</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text variant="callout" muted style={styles.intro}>
            {t('claim.intro')}
          </Text>

          <Card style={styles.fieldsCard}>
            <Field label={t('claim.airline')} value={draft.airline} onChange={(v) => setDraft((d) => ({ ...d, airline: v }))} />
            <Field label={t('claim.flightNo')} value={draft.flightNo} onChange={(v) => setDraft((d) => ({ ...d, flightNo: v }))} />
            <Field label={t('claim.bagTag')} value={draft.bagTag} onChange={(v) => setDraft((d) => ({ ...d, bagTag: v }))} />
            <Field label={t('claim.lostDate')} value={draft.lostDate} onChange={(v) => setDraft((d) => ({ ...d, lostDate: v }))} placeholder="2026-06-12" />
          </Card>

          <Text variant="footnote" color="textTertiary" style={styles.sectionLabel}>
            {t('claim.itemsValue')}
          </Text>
          <Card padding={0}>
            {trip.items.map((it, i) => {
              const included = isIncluded(draft, it.id);
              return (
                <View key={it.id}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
                  <View style={styles.itemRow}>
                    <PressableScale haptic="light" onPress={() => toggle(it.id)} hitSlop={8} style={styles.checkWrap}>
                      <Ionicons
                        name={included ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={included ? colors.primary : colors.textTertiary}
                      />
                    </PressableScale>
                    <Text style={styles.itemEmoji}>{it.emoji}</Text>
                    <Text variant="callout" style={styles.flex} numberOfLines={1} color={included ? 'text' : 'textTertiary'}>
                      {it.name}
                    </Text>
                    <TextInput
                      value={draft.values[it.id] ? String(draft.values[it.id]) : ''}
                      onChangeText={(text) => setValue(it.id, text)}
                      placeholder={t('claim.value')}
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                      editable={included}
                      style={[styles.valueInput, { color: colors.text, backgroundColor: colors.backgroundAlt }]}
                    />
                  </View>
                </View>
              );
            })}
          </Card>

          <View style={[styles.totalRow, { borderTopColor: colors.borderSubtle }]}>
            <Text variant="bodyStrong">{t('claim.total')}</Text>
            <Text variant="title3" color="primary">
              {total.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.disclaimer, { backgroundColor: colors.backgroundAlt }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
            <Text variant="footnote" color="textTertiary" style={styles.flex}>
              {t('claim.disclaimer')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { borderTopColor: colors.borderSubtle, backgroundColor: colors.background }]}>
        <Button
          label={t('claim.share')}
          leftIcon={<Ionicons name="share-outline" size={18} color={colors.onPrimary} />}
          onPress={onShare}
        />
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text variant="caption" muted style={styles.fieldLabel}>
        {label}
      </Text>
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCorrect={false}
        style={[styles.fieldInput, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  iconBtn: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[8] },
  intro: { marginBottom: space[4] },
  fieldsCard: { gap: space[3], marginBottom: space[5] },
  field: { gap: 4 },
  fieldLabel: {},
  fieldInput: { fontSize: 16, paddingVertical: 4 },
  sectionLabel: { marginBottom: space[2], marginLeft: space[2], textTransform: 'uppercase' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: space[5] },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], paddingHorizontal: space[4] },
  checkWrap: { padding: 2 },
  itemEmoji: { fontSize: 22 },
  valueInput: { minWidth: 84, textAlign: 'right', paddingVertical: 6, paddingHorizontal: space[3], borderRadius: radius.md, fontSize: 15 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[4],
    marginTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  disclaimer: { flexDirection: 'row', gap: space[2], padding: space[3], borderRadius: radius.md, marginTop: space[5] },
  bottomBar: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
