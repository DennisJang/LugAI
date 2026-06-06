import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, PressableScale, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/design';
import { useTripStore } from '@/lib/store';

export default function CameraScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const destination = useTripStore((s) => s.destination);
  const setPendingImage = useTripStore((s) => s.setPendingImage);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  const goAnalyze = (uri?: string) => {
    router.replace({ pathname: '/scan/analyzing', params: uri ? { uri } : {} });
  };

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.4,
        base64: true,
        skipProcessing: true,
      });
      if (photo?.base64) setPendingImage({ base64: photo.base64, mimeType: 'image/jpeg' });
      goAnalyze(photo?.uri);
    } catch {
      goAnalyze();
    }
  };

  const pickFromLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.4, base64: true });
    if (!res.canceled) {
      const asset = res.assets[0];
      if (asset?.base64) {
        setPendingImage({ base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' });
      }
      goAnalyze(asset?.uri);
    }
  };

  if (!permission) {
    return <View style={[styles.fill, styles.black]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + space[2] }]}>
        <PressableScale haptic="light" onPress={() => router.back()} style={styles.permClose} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </PressableScale>
        <View style={styles.permBody}>
          <View style={[styles.permIcon, { backgroundColor: colors.primaryTint }]}>
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
          </View>
          <Text variant="title3" center>
            카메라 권한이 필요해요
          </Text>
          <Text variant="callout" muted center>
            짐을 촬영해 규정을 판정하려면 카메라 접근을 허용해주세요.
          </Text>
          <Button label="카메라 허용" onPress={requestPermission} style={styles.permBtn} />
          <PressableScale haptic="light" onPress={pickFromLibrary}>
            <Text variant="subhead" color="primary">
              앨범에서 선택하기
            </Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <View style={[styles.top, { paddingTop: insets.top + space[2] }]}>
        <PressableScale haptic="light" onPress={() => router.back()} accessibilityLabel="닫기" style={styles.iconBtn} hitSlop={10}>
          <Ionicons name="close" size={22} color="#fff" />
        </PressableScale>
        <View style={styles.destChip}>
          <Text style={styles.destFlag}>{destination.flag}</Text>
          <Text variant="subhead" color="#fff">
            {destination.name}
          </Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.guideWrap} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <Text variant="callout" color="#fff" center style={styles.guideText}>
          짐을 펼쳐놓고 한 번에 담아주세요
        </Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space[5] }]}>
        <PressableScale haptic="light" onPress={pickFromLibrary} style={styles.sideBtn}>
          <Ionicons name="images" size={26} color="#fff" />
          <Text variant="footnote" color="#fff">
            앨범
          </Text>
        </PressableScale>
        <PressableScale haptic={null} onPress={capture} pressScale={0.92} accessibilityLabel="촬영" style={styles.shutterOuter}>
          <View style={styles.shutterInner} />
        </PressableScale>
        <View style={styles.sideBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  black: { backgroundColor: '#000' },
  permClose: { paddingHorizontal: space[5], paddingVertical: space[2], alignSelf: 'flex-start' },
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3], paddingHorizontal: space[6] },
  permIcon: { width: 88, height: 88, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: space[2] },
  permBtn: { alignSelf: 'stretch', marginTop: space[4] },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingBottom: space[3],
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: 8,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  destFlag: { fontSize: 18 },
  guideWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
  },
  frame: { width: '76%', aspectRatio: 1 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#fff' },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
  guideText: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[8],
  },
  sideBtn: { width: 56, alignItems: 'center', gap: 3 },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: radius.full,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: radius.full, backgroundColor: '#fff' },
});
