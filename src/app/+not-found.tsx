import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { space } from '@/design';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지 없음' }} />
      <Screen>
        <View style={styles.body}>
          <Text style={styles.emoji}>🧭</Text>
          <Text variant="title3" center>
            페이지를 찾을 수 없어요
          </Text>
          <Text variant="callout" muted center>
            요청하신 화면이 존재하지 않아요.
          </Text>
          <View style={styles.cta}>
            <Button label="홈으로" size="md" fullWidth={false} onPress={() => router.replace('/')} />
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
