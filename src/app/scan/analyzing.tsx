import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { judgeLuggage } from '@/lib/ai';
import { useTripStore } from '@/lib/store';

const STEPS = ['물품을 인식하고 있어요', '규정을 확인하고 있어요', '판정하는 중이에요'];
const PREVIEW = 240;
const MIN_VISIBLE_MS = 1900;

export default function AnalyzingScreen() {
  const { colors } = useTheme();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const destination = useTripStore((s) => s.destination);
  const setCurrentScan = useTripStore((s) => s.setCurrentScan);
  const pendingImage = useTripStore((s) => s.pendingImage);
  const setPendingImage = useTripStore((s) => s.setPendingImage);
  const [step, setStep] = useState(0);

  const scanY = useSharedValue(0);
  useEffect(() => {
    scanY.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [scanY]);
  const scanLineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanY.value * (PREVIEW - 4) }] }));

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1700);

    (async () => {
      const result = await judgeLuggage({
        base64: pendingImage?.base64,
        mimeType: pendingImage?.mimeType,
        destination,
        scannedAt: new Date().toISOString(),
      });
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
      setTimeout(() => {
        if (cancelled) return;
        setCurrentScan(result);
        setPendingImage(null);
        router.replace('/scan/result');
      }, wait);
    })();

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={[styles.preview, { backgroundColor: colors.backgroundAlt }]}>
          {uri ? (
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={styles.placeholder}>🧳</Text>
          )}
          <Animated.View style={[styles.scanLine, { backgroundColor: colors.primary }, scanLineStyle]} />
        </View>
        <View style={styles.texts}>
          <Text variant="title3" center>
            {STEPS[step]}
          </Text>
          <Text variant="callout" muted center>
            {destination.flag} {destination.name} 규정 적용 중
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[7] },
  preview: {
    width: PREVIEW,
    height: PREVIEW,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { fontSize: 72 },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, opacity: 0.9 },
  texts: { gap: space[1] },
});
