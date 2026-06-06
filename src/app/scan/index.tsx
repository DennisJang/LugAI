import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PressableScale, Screen, Text } from '@/components/ui';
import { space, useTheme } from '@/design';

export default function ScanScreen() {
  const { colors } = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <PressableScale haptic="light" onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={28} color={colors.text} />
        </PressableScale>
      </View>
      <View style={styles.body}>
        <Ionicons name="scan" size={56} color={colors.primary} />
        <Text variant="title2" center>
          카메라 스캔
        </Text>
        <Text variant="callout" muted center>
          여기에 카메라 + AI 판정이 들어갑니다 (P2)
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: space[2] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
});
