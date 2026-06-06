import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Chip, Divider, PressableScale, Screen, Text, VerdictBadge } from '@/components/ui';
import { space, useTheme, type VerdictKey } from '@/design';

const CATEGORIES = ['전체', '액체', '배터리', '식품', '날붙이', '세관'];

const CASES: { emoji: string; title: string; place: string; verdict: VerdictKey; tag: string }[] = [
  { emoji: '🧴', title: '면세 향수 3개, 환승에서 압수', place: '🇫🇷 파리 경유', verdict: 'danger', tag: '액체' },
  { emoji: '🔋', title: '보조배터리 2개째는 회수당해요', place: '🇯🇵 도쿄', verdict: 'warning', tag: '배터리' },
  { emoji: '🥩', title: '육포 반입하다 검역 벌금 $300', place: '🇦🇺 시드니', verdict: 'danger', tag: '식품' },
  { emoji: '🥬', title: '의외로 통과! 진공포장 김치', place: '🇺🇸 LA', verdict: 'success', tag: '식품' },
];

const COUNTRIES = [
  { flag: '🇯🇵', name: '일본', rule: '주요 규정 8개' },
  { flag: '🇺🇸', name: '미국', rule: 'TSA 3-1-1 룰' },
  { flag: '🇦🇺', name: '호주', rule: '검역 매우 엄격' },
  { flag: '🇪🇺', name: '유럽연합', rule: '액체 100ml 제한' },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">둘러보기</Text>
        <Text variant="callout" muted>
          여행 전 알아두면 좋은 규정과 사례
        </Text>
      </View>

      {/* 이번 주 피처 */}
      <Card style={[styles.featured, { backgroundColor: colors.primaryTint }]}>
        <View style={styles.featuredTop}>
          <View style={[styles.tag, { backgroundColor: colors.surface }]}>
            <Text variant="footnote" color="primary">
              이번 주 사례
            </Text>
          </View>
          <Text style={styles.featuredEmoji}>🧳</Text>
        </View>
        <Text variant="title3">"기내에 김치 가져가도 돼요?"</Text>
        <Text variant="callout" muted>
          액체류로 분류될 수 있어요. 100ml 룰부터 검역까지 한 번에 정리했어요.
        </Text>
      </Card>

      {/* 카테고리 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}>
        {CATEGORIES.map((c, i) => (
          <Chip key={c} label={c} active={i === 0} />
        ))}
      </ScrollView>

      {/* 사례 */}
      <Text variant="headline" style={styles.sectionTitle}>
        실제 압수 사례
      </Text>
      <View style={styles.caseList}>
        {CASES.map((c) => (
          <PressableScale key={c.title} haptic="light" pressScale={0.98}>
            <Card style={styles.caseCard}>
              <Text style={styles.caseEmoji}>{c.emoji}</Text>
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {c.title}
                </Text>
                <Text variant="caption" muted style={styles.casePlace}>
                  {c.place}
                </Text>
              </View>
              <VerdictBadge verdict={c.verdict} label={c.tag} size="sm" />
            </Card>
          </PressableScale>
        ))}
      </View>

      {/* 나라별 규정 */}
      <Text variant="headline" style={styles.sectionTitle}>
        나라별 규정 한눈에
      </Text>
      <Card padding={0}>
        {COUNTRIES.map((c, i) => (
          <View key={c.name}>
            {i > 0 && <Divider inset={space[5] + 30 + space[3]} />}
            <PressableScale haptic="light" pressScale={0.98}>
              <View style={styles.countryRow}>
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <View style={styles.flex}>
                  <Text variant="body">{c.name}</Text>
                  <Text variant="caption" muted>
                    {c.rule}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </PressableScale>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space[2], gap: 4, marginBottom: space[5] },
  featured: { gap: space[2], marginBottom: space[5] },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingVertical: 5, paddingHorizontal: space[3], borderRadius: 999 },
  featuredEmoji: { fontSize: 30 },
  chipScroll: { marginHorizontal: -space[5], marginBottom: space[6] },
  chips: { gap: space[2], paddingHorizontal: space[5] },
  sectionTitle: { marginBottom: space[3], marginLeft: space[1] },
  caseList: { gap: space[2], marginBottom: space[6] },
  caseCard: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
  caseEmoji: { fontSize: 26 },
  casePlace: { marginTop: 2 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[5],
  },
  countryFlag: { fontSize: 30 },
  flex: { flex: 1 },
});
