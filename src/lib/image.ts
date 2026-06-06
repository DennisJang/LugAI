import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Claude 비전은 긴 변 ~1568px에서 디테일/토큰 균형이 좋음. 라벨(Wh·ml) 판독을 위해
// 과압축(quality 0.4)을 버리고 적정 해상도 + 품질로 다시 인코딩한다.
const MAX_WIDTH = 1400;
const COMPRESS = 0.72;

export interface PreparedImage {
  base64?: string;
  uri?: string;
}

/** AI 분석용 이미지 최적화. 실패 시 원본 uri만 반환(상위에서 폴백). */
export async function optimizeForAI(uri?: string): Promise<PreparedImage> {
  if (!uri) return {};
  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: MAX_WIDTH });
    const image = await context.renderAsync();
    const result = await image.saveAsync({ compress: COMPRESS, format: SaveFormat.JPEG, base64: true });
    return { base64: result.base64 ?? undefined, uri: result.uri };
  } catch {
    return { uri };
  }
}
