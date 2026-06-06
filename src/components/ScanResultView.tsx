import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Card, PressableScale, Text, VerdictBadge } from '@/components/ui';
import { radius, space, spring, useTheme, type VerdictKey } from '@/design';
import { countryName } from '@/lib/countries';
import { useLocale, useT } from '@/lib/i18n';
import { groupByVerdict, type ScanItem, type ScanResult } from '@/lib/mockScan';

const SECTIONS: { key: VerdictKey; titleKey: string }[] = [
  { key: 'danger', titleKey: 'result.secDanger' },
  { key: 'warning', titleKey: 'result.secWarning' },
  { key: 'info', titleKey: 'result.secInfo' },
  { key: 'success', titleKey: 'result.secSuccess' },
];

/** 분석 결과 본문 — 요약 + 그룹 판정 + 펼침 항목 + 면책. (결과 화면·여행 상세 공용) */
export function ScanResultView({ scan }: { scan: ScanResult }) {
  const { colors } = useTheme();
  const t = useT();
  const locale = useLocale();
  const groups = groupByVerdict(scan.items);
  const counts = {
    success: groups.success.length,
    warning: groups.warning.length,
    danger: groups.danger.length,
  };

  return (
    <View>
      <Card style={styles.summary}>
        <View style={styles.summaryHead}>
          <Text style={styles.flag}>{scan.destination.flag}</Text>
          <View style={styles.flex}>
            <Text variant="title3">
              {t('result.summaryTitle', { country: countryName(scan.destination, locale) })}
            </Text>
            <Text variant="caption" muted>
              {t('result.totalItems', { n: scan.items.length })}
            </Text>
          </View>
        </View>
        <View style={[styles.counts, { borderTopColor: colors.borderSubtle }]}>
          <CountStat n={counts.success} label={t('result.cabinOk')} color={colors.verdict.success.fg} />
          <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
          <CountStat n={counts.warning} label={t('result.conditional')} color={colors.verdict.warning.fg} />
          <View style={[styles.vline, { backgroundColor: colors.borderSubtle }]} />
          <CountStat n={counts.danger} label={t('result.checkNeeded')} color={colors.verdict.danger.fg} />
        </View>
      </Card>

      {SECTIONS.map((sec) => {
        const items = groups[sec.key];
        if (!items.length) return null;
        return (
          <View key={sec.key} style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.dot, { backgroundColor: colors.verdict[sec.key].solid }]} />
              <Text variant="headline" style={styles.flex}>
                {t(sec.titleKey)}
              </Text>
              <Text variant="subhead" color="textTertiary">
                {items.length}
              </Text>
            </View>
            <View style={styles.items}>
              {items.map((it) => (
                <ScanItemCard key={it.id} item={it} sourceLabel={t('common.source')} />
              ))}
            </View>
          </View>
        );
      })}

      <View style={[styles.disclaimer, { backgroundColor: colors.backgroundAlt }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
        <Text variant="footnote" color="textTertiary" style={styles.flex}>
          {t('result.disclaimer')}
        </Text>
      </View>
    </View>
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

function ScanItemCard({ item, sourceLabel }: { item: ScanItem; sourceLabel: string }) {
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
          accessibilityLabel={`${item.name}, ${item.badge}`}
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
              {sourceLabel} · {item.source}
            </Text>
          </Animated.View>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  detail: { marginTop: space[3], paddingTop: space[3], borderTopWidth: StyleSheet.hairlineWidth, gap: space[2] },
  caseBox: { padding: space[3], borderRadius: radius.md },
  disclaimer: { flexDirection: 'row', gap: space[2], padding: space[3], borderRadius: radius.md, marginTop: space[2] },
  flex: { flex: 1 },
});
