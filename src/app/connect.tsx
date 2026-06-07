import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';
import { ingestWebhookUrl } from '@/lib/trips';

export default function ConnectScreen() {
  const { colors } = useTheme();
  const t = useT();
  const anonId = useTripStore((s) => s.anonId);
  const url = ingestWebhookUrl();

  const onShare = () => {
    const sample = JSON.stringify(
      { connectCode: anonId, destCode: 'JP', startDate: '2026-06-12', endDate: '2026-06-15', source: 'tripcom' },
      null,
      2,
    );
    void Share.share({
      message: `${t('connect.intro')}\n\nWebhook URL:\n${url ?? t('connect.notConfigured')}\n\nconnectCode:\n${anonId}\n\nPOST JSON:\n${sample}`,
    });
  };

  const steps = [t('connect.step1'), t('connect.step2'), t('connect.step3')];

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
          {t('connect.title')}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="callout" muted style={styles.intro}>
          {t('connect.intro')}
        </Text>

        <Card style={styles.field}>
          <Text variant="caption" muted>
            {t('connect.urlLabel')}
          </Text>
          <Text variant="footnote" selectable style={styles.mono}>
            {url ?? t('connect.notConfigured')}
          </Text>
        </Card>

        <Card style={styles.field}>
          <Text variant="caption" muted>
            {t('connect.codeLabel')}
          </Text>
          <Text variant="bodyStrong" selectable style={styles.mono}>
            {anonId}
          </Text>
        </Card>

        <View style={styles.steps}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: colors.primaryTint }]}>
                <Text variant="footnote" color="primary">
                  {i + 1}
                </Text>
              </View>
              <Text variant="callout" style={styles.flex}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.disclaimer, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text variant="footnote" color="textTertiary" style={styles.flex}>
            {t('connect.disclaimer')}
          </Text>
        </View>

        <Button
          label={t('connect.share')}
          leftIcon={<Ionicons name="share-outline" size={18} color={colors.onPrimary} />}
          onPress={onShare}
          style={styles.shareBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  intro: { marginBottom: space[5] },
  field: { gap: space[2], marginBottom: space[3] },
  mono: { fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }) },
  steps: { gap: space[4], marginTop: space[4], marginBottom: space[5] },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  stepDot: { width: 26, height: 26, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { flexDirection: 'row', gap: space[2], padding: space[3], borderRadius: radius.md, marginBottom: space[6] },
  shareBtn: { alignSelf: 'stretch' },
  flex: { flex: 1 },
});
