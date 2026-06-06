import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScanResultView } from '@/components/ScanResultView';
import { Button, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useTripStore } from '@/lib/store';

export default function ResultScreen() {
  const { colors } = useTheme();
  const scan = useTripStore((s) => s.currentScan);
  const addTrip = useTripStore((s) => s.addTrip);

  const handleSave = () => {
    if (scan) {
      addTrip(scan);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.dismissAll();
  };

  if (!scan) {
    return (
      <Screen edges={['top']}>
        <View style={styles.fallback}>
          <Text variant="headline">분석 결과가 없어요</Text>
          <Button label="홈으로" size="md" fullWidth={false} onPress={() => router.dismissAll()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']} padded={false}>
      <View style={styles.topBar}>
        <PressableScale
          haptic="light"
          onPress={() => router.dismissAll()}
          hitSlop={12}
          accessibilityLabel="닫기"
          style={[styles.closeBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </PressableScale>
        <Text variant="headline">분석 완료</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScanResultView scan={scan} />
      </ScrollView>

      <View style={[styles.bottomBar, { borderTopColor: colors.borderSubtle, backgroundColor: colors.background }]}>
        <View style={styles.flex}>
          <Button label="다시 스캔" variant="secondary" size="md" onPress={() => router.replace('/scan')} />
        </View>
        <View style={styles.flex2}>
          <Button
            label="여행에 저장"
            size="md"
            onPress={handleSave}
            leftIcon={<Ionicons name="bookmark" size={18} color={colors.onPrimary} />}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  closeBtn: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: space[5], paddingBottom: space[6] },
  bottomBar: {
    flexDirection: 'row',
    gap: space[3],
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: { flex: 1 },
  flex2: { flex: 1.5 },
});
