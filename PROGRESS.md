# LugAI — 진행 상황 (자율 빌드 핸드오프)

_업데이트: 2026-06-07_

## 한 줄 요약
사진 한 장으로 여행 짐의 **나라별 반입 규정을 AI가 판정**하는 Expo(React Native) 앱.
핵심 플로우 + 디자인 + 로컬 저장 + AI 연동(폴백) + 스토어 준비까지 완료, **시뮬레이터에서 전 플로우 동작 검증 완료**.

## ✅ 완료 (시뮬레이터 검증됨)
- **디자인 시스템** — Alidoost 미니멀 톤(회색 캔버스 · 플랫 화이트 카드 · 라운드 24 · 라이트 전용) + UI 프리미티브(Text/Screen/Card/Button/PressableScale/VerdictBadge/Chip/Row/Divider).
- **탭 4개** — 홈 / 둘러보기 / 내 여행 / 프로필 + 중앙 스캔 FAB(커스텀 탭바).
- **핵심 플로우** — 목적지 선택 → 카메라(권한 UI)·앨범 → 분석 애니메이션 → **결과(그룹 판정 + 탭 펼침: 왜·사례·출처)** → 여행 저장.
- **로컬 영속화** — zustand + AsyncStorage. 여행 기록·프로필 통계 실데이터.
- **AI** — Supabase Edge Function `judge-luggage`(Claude vision) 코드 완성. 앱은 호출 후 실패/미배포 시 **mock 자동 폴백**(크래시 없음).
- **에러 처리** — 전역 ErrorBoundary, `+not-found`, 카메라/권한/네트워크/타임아웃 처리, 빈 상태.
- **접근성** — accessibilityRole/Label(아이콘 버튼 포함).
- **스토어 준비** — 앱 아이콘·스플래시(브랜드), `app.json`(번들ID `com.lugai.app`, 권한 문구, ITSAppUsesNonExemptEncryption=false, 권한 최소화), `eas.json`, 개인정보처리방침·이용약관(앱 내 화면 + 프로필 링크), `docs/STORE_LISTING.md`.

- **다국어(i18n)** — 한·영·일·중 4개 언어(기기 자동 감지 + 프로필 토글), UI·국가명·mock·둘러보기·약관·AI 출력 언어까지. ✅
- **규정 신뢰도** — 일반 baseline + 국가별 예외 규정 DB(출처 표기) · 나라별 규정 화면 · AI 프롬프트 그라운딩. ✅
- **온보딩** — 첫 실행 3슬라이드 + 게이트. ✅
- **AI 남용 보호** — 이미지 크기 제한 · IP 레이트리밋(`supabase/migrations/0001_rate_limits.sql` 동봉). ✅
- **단위·오프라인** — metric/imperial 토글, 오프라인 배너. ✅
- **테스트·모니터링** — jest 유닛 테스트 통과(`npm test`) · Sentry 가드 init(`EXPO_PUBLIC_SENTRY_DSN` 설정 시 활성). ✅
- **정밀도 #25 (P2·P5·P3 골격)** — ① **P2**: OCR 강조 프롬프트 + 항목별 확신도(low/med/high) + 저확신·고위험 시 "가까이 다시 찍기" 배너·핀 + 측정값 노출(EF→앱→결과 UI, 4언어, mock에서도 동작). ② **P5**: eval 하니스(`src/lib/eval/` 22 라벨 케이스 + 스코어러 + danger 안전 불변식, 오프라인). ③ **P3 골격**: `0002_regulations_corpus.sql`(pgvector 코퍼스+RLS+시드+`match_regulations`) + `embed-corpus` EF(gte-small 백필) + `judge-luggage` 동적 grounding(정적 폴백). **배포 전까지 앱 정상**. 설계: `docs/PRECISION_ARCHITECTURE.md`. ✅(P3는 배포 대기)
- **정밀도 #25 (P4 플라이휠 v1)** — 결과 화면 항목별 **정정/확인 피드백**(펼침→"정확했나요? 정확/아니요"→"실제로는?" 3택→익명 전송, 4언어). `submit-feedback` EF + `feedback` 자기충족 컬럼(`0003`) + `src/lib/feedback.ts`(graceful) + store `anonId`. **사용자 명시 행동만 익명 전송**(사진·PII 미포함), 개인정보처리방침 반영. ✅(EF 배포 대기)

## ⚠️ 사용자가 해야 할 일
1. **AI 실연동 + 정밀도 RAG 활성화 (`docs/SUPABASE_SETUP.md`)**
   - P1: `npx supabase functions deploy judge-luggage --no-verify-jwt` + `npx supabase secrets set ANTHROPIC_API_KEY=...` (프로젝트 `anmmvrftdgnindvkylsr`)
   - P3: `npx supabase db push`(0002 코퍼스 + 0003 feedback) → `embed-corpus` 배포·백필 1회 → `judge-luggage` 재배포. (문서 "🔑 정밀도(P3)" 섹션)
   - P4: `npx supabase functions deploy submit-feedback --no-verify-jwt` (피드백 수집 활성화)
   - 이 세션의 Supabase MCP가 해당 프로젝트에 접근 불가해 **자동 배포 못 함**. 배포 전까지 앱은 mock + 정적 grounding으로 정상 동작. 세팅 완료 후 알려주면 라이브 검증.
2. **support 이메일 교체** — `src/lib/legal.ts`·`STORE_LISTING.md`의 `support@lugai.app` → 실제 운영 이메일.
3. **GitHub push** — 로컬 커밋 완료. `main` 직접 푸시는 권한 게이트로 보류 중. "push" 지시 주면 올림(또는 직접 `git push -u origin main`).
4. **스토어 제출** — `STORE_LISTING.md` 카피 사용, 개인정보처리방침 URL 호스팅 후 입력, **프로덕션 빌드**에서 스크린샷 캡처(현재 dev 화면엔 Expo Go 톱니가 보임 — 실제 빌드엔 없음).

## 실행 / 검증
- 실행: `npx expo start --ios` (cwd=프로젝트 루트). 시뮬레이터엔 카메라 없음 → **"앨범에서 선택"**으로 스캔 테스트.
- 타입체크: `npx tsc --noEmit -p tsconfig.json` · 헬스: `npx expo-doctor`.
- 스크린샷: `xcrun simctl io booted screenshot out.png`.

## 빌드 / 배포
- `eas build -p ios --profile production`, `eas build -p android --profile production` (EAS 계정 필요).
- 개인정보처리방침 공개 URL: 앱 내 화면이 정본. 공개 URL이 필요하면 `src/lib/legal.ts` 내용을 정적 페이지로 호스팅(Vercel/GitHub Pages).

## 향후 (P2+)
- 계정/동기화(Supabase Auth) + 클라우드 여행 저장 + **계정 삭제 화면**(Apple 요구사항, 계정 도입 시 필수).
- 규정 시드 DB로 정확도/캐싱 강화(Claude는 보강용).
- AI 남용 방지(rate limit), 영어 등 다국어.

## 보안
- `.env.local`은 **gitignore**(추적 안 됨, 확인 완료). `service_role`·`ANTHROPIC_API_KEY`는 **앱 번들·깃에 미포함**(서버 전용). 앱 코드는 `EXPO_PUBLIC_*`만 사용.

## 구조
```
src/app/        expo-router 라우트: (tabs)/, scan/, legal/, destination, _layout, +not-found
src/components/ ui/ 프리미티브 + LugTabBar, LegalDoc, ErrorScreen
src/design/     tokens.ts(토큰) · theme.ts(테마·useTheme)
src/lib/        store(zustand+persist) · countries · mockScan · ai · legal
supabase/functions/judge-luggage/  Claude vision Edge Function
docs/           SUPABASE_SETUP.md · STORE_LISTING.md · screenshots/
```
