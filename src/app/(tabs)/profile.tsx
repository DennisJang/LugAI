import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Divider, Row, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useTripStore } from '@/lib/store';

const ROW_INSET = space[5] + 34 + space[3];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const trips = useTripStore((s) => s.trips);
  const itemCount = trips.reduce((n, t) => n + t.items.length, 0);
  const countryCount = new Set(trips.map((t) => t.destination.code)).size;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">프로필</Text>
      </View>

      {/* 계정 (게스트) */}
      <Card style={styles.account}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="person" size={28} color={colors.textTertiary} />
        </View>
        <View style={styles.flex}>
          <Text variant="title3">게스트</Text>
          <Text variant="caption" muted>
            로그인 없이 사용 중 · 계정 동기화 곧 제공
          </Text>
        </View>
      </Card>

      {/* 통계 */}
      <View style={styles.stats}>
        <Card style={styles.statTile}>
          <Text variant="title1">{itemCount}</Text>
          <Text variant="caption" muted>
            스캔한 물품
          </Text>
        </Card>
        <Card style={styles.statTile}>
          <Text variant="title1">{countryCount}</Text>
          <Text variant="caption" muted>
            다녀온 나라
          </Text>
        </Card>
      </View>

      {/* 설정 */}
      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        설정
      </Text>
      <Card padding={0}>
        <Row icon="options-outline" label="단위" value="ml · cm" showChevron={false} />
        <Divider inset={ROW_INSET} />
        <Row icon="language-outline" label="언어" value="한국어" showChevron={false} />
      </Card>

      {/* 정보 */}
      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        정보
      </Text>
      <Card padding={0}>
        <Row
          icon="shield-checkmark-outline"
          label="개인정보처리방침"
          onPress={() => router.push('/legal/privacy')}
        />
        <Divider inset={ROW_INSET} />
        <Row icon="document-text-outline" label="이용약관" onPress={() => router.push('/legal/terms')} />
        <Divider inset={ROW_INSET} />
        <Row icon="information-circle-outline" label="버전" value="1.0.0" showChevron={false} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space[2], marginBottom: space[5] },
  account: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  avatar: { width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: space[3], marginTop: space[6], marginBottom: space[6] },
  statTile: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space[5] },
  groupTitle: { marginBottom: space[2], marginLeft: space[3], textTransform: 'uppercase' },
  flex: { flex: 1 },
});
