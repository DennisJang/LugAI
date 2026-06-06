import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/design';

/** 그룹 리스트 구분선. inset으로 좌측 들여쓰기(아이콘/플래그 정렬). */
export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: StyleSheet.hairlineWidth, marginLeft: inset, backgroundColor: colors.borderSubtle }} />
  );
}
