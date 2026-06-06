import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, PressableScale, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useT } from '@/lib/i18n';
import { useTripStore } from '@/lib/store';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const setOnboarded = useTripStore((s) => s.setOnboarded);
  const [page, setPage] = useState(0);
  const ref = useRef<ScrollView>(null);

  const slides = [
    { emoji: '📸', title: t('onboarding.s1Title'), desc: t('onboarding.s1Desc') },
    { emoji: '🌍', title: t('onboarding.s2Title'), desc: t('onboarding.s2Desc') },
    { emoji: '🧳', title: t('onboarding.s3Title'), desc: t('onboarding.s3Desc') },
  ];
  const last = page === slides.length - 1;

  const finish = () => {
    setOnboarded(true);
    router.replace('/');
  };

  const next = () => {
    if (last) finish();
    else ref.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + space[5] },
      ]}>
      <View style={styles.skipRow}>
        {!last ? (
          <PressableScale haptic="light" onPress={finish} hitSlop={10}>
            <Text variant="subhead" color="textTertiary">
              {t('onboarding.skip')}
            </Text>
          </PressableScale>
        ) : null}
      </View>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.flex}>
        {slides.map((s) => (
          <View key={s.title} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryTint }]}>
              <Text style={styles.emoji}>{s.emoji}</Text>
            </View>
            <Text variant="title1" center style={styles.title}>
              {s.title}
            </Text>
            <Text variant="body" muted center>
              {s.desc}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { width: i === page ? 20 : 8, backgroundColor: i === page ? colors.primary : colors.border }]}
          />
        ))}
      </View>

      <View style={styles.cta}>
        <Button label={last ? t('onboarding.start') : t('onboarding.next')} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  skipRow: { height: 40, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: space[5] },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[8], gap: space[4] },
  iconCircle: { width: 120, height: 120, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: space[4] },
  emoji: { fontSize: 60 },
  title: {},
  dots: { flexDirection: 'row', justifyContent: 'center', gap: space[1], marginBottom: space[6] },
  dot: { height: 8, borderRadius: radius.full },
  cta: { paddingHorizontal: space[5] },
});
