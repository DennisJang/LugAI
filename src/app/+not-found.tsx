import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { space } from '@/design';
import { useT } from '@/lib/i18n';

export default function NotFoundScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t('notfound.title') }} />
      <Screen>
        <View style={styles.body}>
          <Text style={styles.emoji}>🧭</Text>
          <Text variant="title3" center>
            {t('notfound.title')}
          </Text>
          <Text variant="callout" muted center>
            {t('notfound.desc')}
          </Text>
          <View style={styles.cta}>
            <Button label={t('common.goHome')} size="md" fullWidth={false} onPress={() => router.replace('/')} />
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2] },
  emoji: { fontSize: 52, marginBottom: space[2] },
  cta: { marginTop: space[5] },
});
