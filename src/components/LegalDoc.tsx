import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useT } from '@/lib/i18n';
import type { LegalDocData } from '@/lib/legal';

export function LegalDoc({ doc }: { doc: LegalDocData }) {
  const { colors } = useTheme();
  const t = useT();
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
        <Text variant="headline" style={styles.flex} numberOfLines={1}>
          {doc.title}
        </Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="caption" color="textTertiary" style={styles.updated}>
          {t('legal.updated')} · {doc.updated}
        </Text>
        <Text variant="callout" muted style={styles.intro}>
          {doc.intro}
        </Text>
        {doc.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text variant="bodyStrong" style={styles.heading}>
              {s.heading}
            </Text>
            <Text variant="callout" color="textSecondary" style={styles.bodyText}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
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
  updated: { marginBottom: space[4] },
  intro: { marginBottom: space[6], lineHeight: 23 },
  section: { marginBottom: space[5] },
  heading: { marginBottom: space[2] },
  bodyText: { lineHeight: 23 },
  flex: { flex: 1 },
});
