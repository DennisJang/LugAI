import '@/global.css';

import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initMonitoring } from '@/lib/monitoring';
import { useTripStore } from '@/lib/store';

export { ErrorScreen as ErrorBoundary } from '@/components/ErrorScreen';

/** 첫 실행이면 온보딩으로 분기 */
function OnboardingGate() {
  const hasHydrated = useTripStore((s) => s.hasHydrated);
  const onboarded = useTripStore((s) => s.onboarded);
  useEffect(() => {
    if (hasHydrated && !onboarded) router.replace('/onboarding');
  }, [hasHydrated, onboarded]);
  return null;
}

export default function RootLayout() {
  useEffect(() => {
    initMonitoring();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="destination" options={{ presentation: 'modal' }} />
          <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
