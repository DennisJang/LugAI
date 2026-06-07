// 프리미엄 미니멀 짐보관 지도 (rnmapbox). ⚠️ Expo Go 불가 — EAS dev build에서만 렌더.
// storage 화면이 Expo Go에선 이 컴포넌트를 require하지 않음(가드). dev build + EXPO_PUBLIC_MAPBOX_TOKEN 필요.
import Mapbox, { Camera, CircleLayer, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/design';
import type { StorageSpot } from '@/lib/storage';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) Mapbox.setAccessToken(MAPBOX_TOKEN);

export default function StorageMap({ spots, center }: { spots: StorageSpot[]; center: { lat: number; lng: number } }) {
  const { colors } = useTheme();
  // 토큰 없으면 빈 회색 지도 대신 그냥 렌더 안 함 → storage 화면이 리스트만 보여줌(graceful).
  if (!MAPBOX_TOKEN) return null;
  const fc = {
    type: 'FeatureCollection' as const,
    features: spots.map((s) => ({
      type: 'Feature' as const,
      id: String(s.id),
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, kind: s.kind },
    })),
  };

  return (
    <View style={styles.wrap}>
      <MapView style={StyleSheet.absoluteFill} styleURL={Mapbox.StyleURL.Light} scaleBarEnabled={false} logoEnabled={false} attributionEnabled={false}>
        <Camera centerCoordinate={[center.lng, center.lat]} zoomLevel={13} animationDuration={600} />
        <ShapeSource id="spots" shape={fc} cluster clusterRadius={48}>
          <CircleLayer
            id="clusters"
            filter={['has', 'point_count']}
            style={{ circleColor: colors.primary, circleRadius: 18, circleOpacity: 0.9, circleStrokeWidth: 3, circleStrokeColor: '#fff' }}
          />
          <SymbolLayer
            id="cluster-count"
            filter={['has', 'point_count']}
            style={{ textField: ['get', 'point_count_abbreviated'], textSize: 13, textColor: '#fff', textFont: ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'] }}
          />
          <CircleLayer
            id="single"
            filter={['!', ['has', 'point_count']]}
            style={{ circleColor: colors.primary, circleRadius: 8, circleStrokeWidth: 2.5, circleStrokeColor: '#fff' }}
          />
        </ShapeSource>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: 'hidden' },
});
