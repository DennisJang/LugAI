import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { radius, space, useTheme, type VerdictKey } from '@/design';

const EXAMPLES: { emoji: string; name: string; verdict: VerdictKey; label: string }[] = [
  { emoji: '🔋', name: '보조배터리 20,000mAh', verdict: 'warning', label: '기내만' },
  { emoji: '💧', name: '화장품 120ml', verdict: 'danger', label: '100ml 초과' },
  { emoji: '✂️', name: '손톱깎이', verdict: 'success', label: '기내 OK' },
];

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll>
      {/* 인사 */}
      <View style={styles.greeting}>
        <Text variant="subhead" muted>
          안녕하세요 👋
        </Text>
        <Text variant="title1">어디로 떠나세요?</Text>
      </View>

      {/* 도착지 */}
      <PressableScale haptic="light" onPress={() => {}} style={styles.destBlock}>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.flag}>🇯🇵</Text>
              <View style={styles.gap2}>
                <Text variant="caption" muted>
                  도착지
                </Text>
                <Text variant="title3">일본 · 도쿄</Text>
              </View>
            </View>
            <View style={[styles.changeChip, { backgroundColor: colors.backgroundAlt }]}>
              <Text variant="footnote" color="textSecondary">
                변경
              </Text>
              <Ionicons name="chevron-forward" size={13} color={colors.textTertiary} />
            </View>
          </View>
        </Card>
      </PressableScale>

      {/* 스캔 히어로 */}
      <Card bordered={false} style={[styles.heroCard, { backgroundColor: colors.primaryTint }]}>
        <View style={[styles.scanIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="scan" size={32} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text variant="title3" center>
            짐을 펼쳐놓고 한 장
          </Text>
          <Text variant="callout" muted center>
            AI가 도착지 규정으로 자동 판정해드려요
          </Text>
        </View>
        <Button
          label="스캔 시작"
          leftIcon={<Ionicons name="camera" size={20} color={colors.onPrimary} />}
          onPress={() => router.push('/scan')}
        />
      </Card>

      {/* 예시 판정 — 그룹 리스트 */}
      <Text variant="headline" style={styles.sectionTitle}>
        이런 것들을 잡아드려요
      </Text>
      <Card padding={0} style={styles.exampleGroup}>
        {EXAMPLES.map((it, i) => (
          <View key={it.name}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
            <View style={styles.exampleRow}>
              <Text style={styles.exampleEmoji}>{it.emoji}</Text>
              <Text variant="body" style={styles.flex}>
                {it.name}
              </Text>
              <VerdictBadge verdict={it.verdict} label={it.label} size="sm" />
            </View>
          </View>
        ))}
      </Card>

      {/* 둘러보기 티저 */}
      <PressableScale haptic="light" onPress={() => router.push('/discover')}>
        <Card style={styles.teaser}>
          <Text style={styles.teaserEmoji}>🧳</Text>
          <View style={styles.flex}>
            <Text variant="bodyStrong">황당 압수 사례 모음</Text>
            <Text variant="caption" muted>
              공항에서 실제로 걸린 물건들
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Card>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { paddingTop: space[3], gap: 2, marginBottom: space[6] },
  destBlock: { marginBottom: space[5] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  gap2: { gap: 2 },
  flag: { fontSize: 34 },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 7,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
  },
  heroCard: {
    marginBottom: space[7],
    alignItems: 'center',
    paddingVertical: space[8],
    gap: space[4],
  },
  scanIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: space[1], alignItems: 'center' },
  sectionTitle: { marginBottom: space[3], marginLeft: space[1] },
  exampleGroup: { marginBottom: space[7] },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[4],
    paddingHorizontal: space[5],
  },
  exampleEmoji: { fontSize: 24 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: space[5] + 24 + space[3] },
  teaser: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  teaserEmoji: { fontSize: 28 },
  flex: { flex: 1 },
});
