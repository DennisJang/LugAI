import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { space, useTheme } from '@/design';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: 'background' | 'backgroundAlt';
  edges?: readonly Edge[];
  contentStyle?: ViewStyle;
}

/** 세이프에어리어 + 배경 + (옵션)스크롤을 처리하는 화면 컨테이너. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  background = 'background',
  edges = ['top'],
  contentStyle,
}: ScreenProps) {
  const { colors } = useTheme();
  const padding = padded ? { paddingHorizontal: space[5] } : null;

  return (
    <SafeAreaView edges={edges as Edge[]} style={[styles.flex, { backgroundColor: colors[background] }]}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padding, styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: space[12] },
});
