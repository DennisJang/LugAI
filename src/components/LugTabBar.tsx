import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
// expo-router 56은 react-navigation/bottom-tabs를 벤더링함 → 빌드 출력에서 타입을 가져온다.
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Text } from '@/components/ui';
import { radius, shadow, space, useTheme } from '@/design';

type TabMeta = {
  label: string;
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
};

const TABS: Record<string, TabMeta> = {
  index: { label: '홈', active: 'home', inactive: 'home-outline' },
  discover: { label: '둘러보기', active: 'compass', inactive: 'compass-outline' },
  trips: { label: '내 여행', active: 'briefcase', inactive: 'briefcase-outline' },
  profile: { label: '프로필', active: 'person', inactive: 'person-outline' },
};

export function LugTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes;
  const mid = Math.floor(routes.length / 2);

  const renderTab = (route: { key: string; name: string }, index: number) => {
    const meta = TABS[route.name];
    if (!meta) return null;
    const focused = state.index === index;
    const color = focused ? colors.primary : colors.textTertiary;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
    };
    return (
      <PressableScale
        key={route.key}
        haptic="selection"
        pressScale={0.9}
        onPress={onPress}
        style={styles.tab}>
        <Ionicons name={focused ? meta.active : meta.inactive} size={24} color={color} />
        <Text variant="footnote" color={color}>
          {meta.label}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          paddingBottom: insets.bottom > 0 ? insets.bottom : space[3],
        },
      ]}>
      {routes.slice(0, mid).map((r) => renderTab(r, routes.indexOf(r)))}

      <View style={styles.fabSlot}>
        <PressableScale
          haptic="medium"
          pressScale={0.92}
          onPress={() => router.push('/scan')}
          style={[styles.fab, { backgroundColor: colors.primary }, shadow.lg]}>
          <Ionicons name="scan" size={26} color={colors.onPrimary} />
        </PressableScale>
      </View>

      {routes.slice(mid).map((r) => renderTab(r, routes.indexOf(r)))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: space[1] },
  fabSlot: { width: 72, alignItems: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
});
