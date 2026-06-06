import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Button, Card, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { radius, space, spring, useTheme, type VerdictKey } from '@/design';
import { groupByVerdict, type ScanItem } from '@/lib/mockScan';
import { useTripStore } from '@/lib/store';

const SECTIONS: { key: VerdictKey; title: string }[] = [
  { key: 'danger', title: '꼭 확인하세요' },
  { key: 'warning', title: '조건부 허용' },
  { key: 'info', title: '신고 · 확인 권장' },
  { key: 'success', title: '기내 반입 OK' },
];

export default function ResultScreen() {
  const { colors } = useTheme();
  const scan = useTripStore((s) => s.currentScan);
  const addTrip = useTripStore((s) => s.addTrip);

  const handleSave = () => {
    if (scan) addTrip(scan);
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

  const groups = groupByVerdict(scan.items);
  const counts = {
    success: groups.success.length,
    warning: groups.warning.length,
    danger: groups.danger.length,
  };

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
        {/* 요약 */}
        <Card style={styles.summary}>
          <View style={styles.summaryHead}>
            <Text style={styles.flag}>{scan.destination.flag}</Text>
            <View style={styles.flex}>
              <Text variant="title3">{scan.destination.name}행 짐 분석</Text>
              <Text variant="caption" muted>
                총 {scan.items.length}개 물품
              </Text>
            </View>
          </View>
          <View style={[styles.counts, { borderTopColor: colors.borderSubtle }]}>
            <CountStat n={counts.success} label="기내 OK" color={colors.verdict.success.fg} />
            <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
            <CountStat n={counts.warning} label="조건부" color={colors.verdict.warning.fg} />
            <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
            <CountStat n={counts.danger} label="확인 필요" color={colors.verdict.danger.fg} />
          </View>
        </Card>

        {/* 그룹별 판정 */}
        {SECTIONS.map((sec) => {
          const items = groups[sec.key];
          if (!items.length) return null;
          return (
            <View key={sec.key} style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={[styles.dot, { backgroundColor: colors.verdict[sec.key].solid }]} />
                <Text variant="headline" style={styles.flex}>
                  {sec.title}
                </Text>
                <Text variant="subhead" color="textTertiary">
                  {items.length}
                </Text>
              </View>
              <View style={styles.items}>
                {items.map((it) => (
                  <ScanItemCard key={it.id} item={it} />
                ))}
              </View>
            </View>
          );
        })}

        {/* 면책 */}
        <View style={[styles.disclaimer, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text variant="footnote" color="textTertiary" style={styles.flex}>
            AI 판정은 참고용이에요. 최종 반입 여부는 항공사·도착지 규정을 꼭 확인하세요.
          </Text>
        </View>
      </ScrollView>

      {/* 하단 액션 */}
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

function CountStat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <View style={styles.countItem}>
      <Text variant="title2" color={color}>
        {n}
      </Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </View>
  );
}

function ScanItemCard({ item }: { item: ScanItem }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withSpring(expanded ? 1 : 0, spring.default);
  }, [expanded, rot]);

  const chevStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 180}deg` }] }));

  return (
    <Animated.View layout={LinearTransition.springify().damping(22).stiffness(220)}>
      <Card>
        <PressableScale
          haptic="light"
          pressScale={1}
          onPress={() => setExpanded((e) => !e)}
          style={styles.itemHeader}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          <View style={styles.flex}>
            <Text variant="bodyStrong">{item.name}</Text>
            <Text variant="caption" muted numberOfLines={expanded ? undefined : 1}>
              {item.reason}
            </Text>
          </View>
          <VerdictBadge verdict={item.verdict} label={item.badge} size="sm" />
          <Animated.View style={chevStyle}>
            <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
          </Animated.View>
        </PressableScale>

        {expanded && (
          <Animated.View
            entering={FadeIn.duration(160)}
            style={[styles.detail, { borderTopColor: colors.borderSubtle }]}>
            <Text variant="callout">{item.detail}</Text>
            {item.caseNote ? (
              <View style={[styles.caseBox, { backgroundColor: colors.backgroundAlt }]}>
                <Text variant="caption" color="textSecondary">
                  💡 {item.caseNote}
                </Text>
              </View>
            ) : null}
            <Text variant="footnote" color="textTertiary">
              출처 · {item.source}
            </Text>
          </Animated.View>
        )}
      </Card>
    </Animated.View>
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
  summary: { gap: space[4], marginBottom: space[6] },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  flag: { fontSize: 36 },
  counts: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space[4] },
  countItem: { flex: 1, alignItems: 'center', gap: 2 },
  vline: { width: StyleSheet.hairlineWidth, height: 30 },
  section: { marginBottom: space[6] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[3], marginLeft: space[1] },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  items: { gap: space[2] },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  itemEmoji: { fontSize: 26 },
  detail: {
    marginTop: space[3],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: space[2],
  },
  caseBox: { padding: space[3], borderRadius: radius.md },
  disclaimer: {
    flexDirection: 'row',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    marginTop: space[2],
  },
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
