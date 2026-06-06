@AGENTS.md

# LugAI

사진 한 장으로 여행 짐의 나라별 반입 규정을 AI가 판정하는 앱.
**Expo SDK 56 / React Native 0.85 / React 19 / expo-router / Reanimated 4.** 진행 상황은 `PROGRESS.md`.

## 명령
- 실행: `npx expo start --ios` (시뮬레이터엔 카메라 없음 → "앨범에서 선택"으로 스캔 테스트)
- 타입체크: `npx tsc --noEmit -p tsconfig.json`
- 헬스체크: `npx expo-doctor`
- 아이콘 재생성: `node scripts/gen-icons.mjs`

## 구조
- `src/app/*` — expo-router 라우트. `(tabs)`=홈/둘러보기/내여행/프로필, `scan/`=카메라→분석→결과, `legal/`, `destination`.
- `src/design/` — 디자인 토큰(`tokens.ts`)·테마(`theme.ts`, `useTheme`). `src/components/ui/` — 프리미티브.
- `src/lib/` — `store`(zustand+persist)·`countries`·`mockScan`·`ai`(Edge Function 호출 + mock 폴백)·`legal`.
- `supabase/functions/judge-luggage/` — Claude vision Edge Function(Deno). tsconfig에서 제외됨.

## 규칙 / 주의
- 스타일: **bespoke 디자인 토큰 + StyleSheet** (NativeWind·Moti 미사용 — SDK56의 Reanimated 4와 충돌). 모션은 Reanimated 4 직접.
- 비주얼: Mohammadreza Alidoost(Dribbble) 미니멀 톤. **라이트 전용**(다크모드 미사용).
- 색은 4종 verdict(success/warning/danger/info)로 절제, 뉘앙스는 라벨로. 텍스트 덩어리 금지(카드·뱃지·점진적 공개).
- **시크릿 금지**: `ANTHROPIC_API_KEY`·`service_role`은 앱/깃에 절대 포함 X. 앱은 `EXPO_PUBLIC_*`만. AI는 Edge Function(서버)에서만.
- **typedRoutes ON**: 라우트 추가 후 dev 서버가 떠 있어야 `.expo/types` 재생성됨. 서버 꺼진 채 새 라우트를 tsc하면 stale 에러가 날 수 있음(서버 재기동하면 해소).
- 새 코드 작성 전 Expo v56 문서 확인(AGENTS.md).
