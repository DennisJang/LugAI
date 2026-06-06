import type { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { space, useTheme } from '@/design';

/** expo-router 전역 에러 바운더리 — 렌더 에러 시 친화적 폴백. */
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.emoji}>🧳</Text>
        <Text variant="title3" center>
          문제가 발생했어요
        </Text>
        <Text variant="callout" muted center>
          잠시 후 다시 시도해주세요.{'\n'}문제가 계속되면 앱을 다시 실행해 주세요.
        </Text>
        <View style={styles.cta}>
          <Button label="다시 시도" size="md" fullWidth={false} onPress={() => retry()} />
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
