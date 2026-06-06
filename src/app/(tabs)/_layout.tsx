import { Tabs } from 'expo-router';

import { LugTabBar } from '@/components/LugTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <LugTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
