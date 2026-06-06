import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ScanResultView } from '@/components/ScanResultView';
import { Button, PressableScale, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useTripStore } from '@/lib/store';

export default function TripDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTripStore((s) => s.trips.find((t) => t.id === id));
  const removeTrip = useTripStore((s) => s.removeTrip);

  if (!trip) {
    return (
      <Screen edges={['top']}>
        <View style={styles.fallback}>
          <Text variant="headline">여행을 찾을 수 없어요</Text>
          <Button label="뒤로" size="md" fullWidth={false} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert('여행 삭제', `'${trip.destination.name}' 기록을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removeTrip(trip.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={styles.topBar}>
        <PressableScale
          haptic="light"
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="뒤로"
          style={[styles.iconBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </PressableScale>
        <Text variant="headline" numberOfLines={1}>
          {trip.destination.flag} {trip.destination.name}
        </Text>
        <PressableScale
          haptic="light"
          onPress={confirmDelete}
          hitSlop={12}
          accessibilityLabel="여행 삭제"
          style={[styles.iconBtn, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="trash-outline" size={18} color={colors.verdict.danger.fg} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScanResultView
          scan={{ destination: trip.destination, items: trip.items, scannedAt: trip.createdAt }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
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
});
