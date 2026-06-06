import { getLocales } from 'expo-localization';
import type { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { space, useTheme } from '@/design';
import { t } from '@/lib/i18n';

/** expo-router 전역 에러 바운더리 — 렌더 에러 시 친화적 폴백. (store 비의존, 순수 t 사용) */
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useTheme();
  const locale = getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en';
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.emoji}>🧳</Text>
        <Text variant="title3" center>
          {t(locale, 'error.title')}
        </Text>
        <Text variant="callout" muted center>
          {t(locale, 'error.desc')}
        </Text>
        <View style={styles.cta}>
          <Button label={t(locale, 'common.retry')} size="md" fullWidth={false} onPress={() => retry()} />
        </View>
        {__DEV__ ? (
          <Text variant="footnote" color="textTertiary" style={[styles.dev, { color: colors.textTertiary }]}>
            {error.message}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[4] },
  emoji: { fontSize: 52, marginBottom: space[2] },
  cta: { marginTop: space[5] },
  dev: { marginTop: space[5], textAlign: 'center' },
});
