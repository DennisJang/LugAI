import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, shadow, space, useTheme } from '@/design';

export interface CardProps extends ViewProps {
  children: ReactNode;
  /** 내부 패딩(px) */
  padding?: number;
  /** 강조 카드(소프트 섀도) */
  elevated?: boolean;
  /** 테두리 사용(기본: 회색 캔버스 위 플랫 화이트) */
  bordered?: boolean;
}

/** 표면 카드 — 회색 캔버스 위 플랫 화이트(테두리·그림자 없음), 넉넉한 라운드. (Alidoost: 미니멀) */
export function Card({
  children,
  padding = space[5],
  elevated = false,
  bordered = false,
  style,
  ...rest
}: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          padding,
          borderColor: bordered ? colors.borderSubtle : 'transparent',
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
        },
        elevated && shadow.md,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius['2xl'] },
});
