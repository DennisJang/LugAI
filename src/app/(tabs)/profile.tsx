import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Divider, Row, Screen, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';

const ROW_INSET = space[5] + 34 + space[3];

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title1">프로필</Text>
      </View>

      {/* 계정 */}
      <Card style={styles.account}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundAlt }]}>
          <Ionicons name="person" size={28} color={colors.textTertiary} />
        </View>
        <View style={styles.flex}>
          <Text variant="title3">여행자님</Text>
          <Text variant="caption" muted>
            로그인하고 여행 기록을 저장하세요
          </Text>
        </View>
      </Card>
      <View style={styles.loginBtn}>
        <Button label="로그인 / 회원가입" size="md" onPress={() => {}} />
      </View>

      {/* 통계 */}
      <View style={styles.stats}>
        <Card style={styles.statTile}>
          <Text variant="title1">0</Text>
          <Text variant="caption" muted>
            스캔한 짐
          </Text>
        </Card>
        <Card style={styles.statTile}>
          <Text variant="title1">2</Text>
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
        <Row icon="options-outline" label="단위" value="ml · cm" onPress={() => {}} />
        <Divider inset={ROW_INSET} />
        <Row icon="notifications-outline" label="알림" onPress={() => {}} />
        <Divider inset={ROW_INSET} />
        <Row icon="language-outline" label="언어" value="한국어" onPress={() => {}} />
      </Card>

      {/* 정보 */}
      <Text variant="footnote" color="textTertiary" style={styles.groupTitle}>
        정보
      </Text>
      <Card padding={0}>
        <Row icon="help-circle-outline" label="도움말" onPress={() => {}} />
        <Divider inset={ROW_INSET} />
        <Row icon="document-text-outline" label="약관 · 개인정보" onPress={() => {}} />
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
  loginBtn: { marginTop: space[3], marginBottom: space[6] },
  stats: { flexDirection: 'row', gap: space[3], marginBottom: space[6] },
  statTile: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space[5] },
  groupTitle: { marginBottom: space[2], marginLeft: space[3], textTransform: 'uppercase' },
  flex: { flex: 1 },
});
