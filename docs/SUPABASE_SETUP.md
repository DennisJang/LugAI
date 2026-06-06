# Supabase 설정 — `judge-luggage` Edge Function

LugAI의 AI 판정은 Supabase Edge Function `judge-luggage`가 **Claude vision**을 호출해 처리합니다.
Anthropic 키는 **서버(Edge Function 시크릿)** 에만 두고 앱/깃에는 절대 넣지 않습니다.
(아래 배포 전까지 앱은 자동으로 **mock 판정**으로 동작합니다 — 크래시 없음.)

> 참고: 이 빌드 세션의 Supabase MCP는 다른 계정/프로젝트(`lacytifeieplwioosepg`)에만 접근 가능해서,
> 사용자의 프로젝트(`anmmvrftdgnindvkylsr`)로는 자동 배포가 불가했습니다. 아래 2단계만 직접 실행해주세요.

## 1) 함수 배포

```bash
# 프로젝트 루트에서
npx supabase login                                   # 최초 1회 (브라우저 인증)
npx supabase link --project-ref anmmvrftdgnindvkylsr
npx supabase functions deploy judge-luggage --no-verify-jwt
```

- `--no-verify-jwt`: 익명(publishable anon 키) 호출 허용 — 공개 프록시로 동작.

## 2) Anthropic 키 시크릿 설정

```bash
# .env.local 의 ANTHROPIC_API_KEY 값을 그대로 사용 (채팅/깃에 노출 금지)
npx supabase secrets set ANTHROPIC_API_KEY="<여기에 키>" --project-ref anmmvrftdgnindvkylsr
```

- 또는 Supabase 대시보드 → Edge Functions → `judge-luggage` → Secrets 에서 `ANTHROPIC_API_KEY` 추가.

## 확인

- 앱에서 스캔 → 분석 시 실제 Claude 판정이 나오면 성공.
- 실패하면 앱이 자동으로 mock 폴백 → 사용자 경험은 끊기지 않음.
- 함수 로그: 대시보드 → Edge Functions → Logs.

## 모델 변경

`supabase/functions/judge-luggage/index.ts` 의 `MODEL` 상수:
- `claude-sonnet-4-6` (기본, 균형)
- `claude-opus-4-8` (고정밀, 비용↑)
- `claude-haiku-4-5-20251001` (저비용·빠름)

## (선택) 레이트리밋 — 남용 방지
함수에 IP 레이트리밋(기본 30회/시간)이 내장돼 있고, 아래 마이그레이션을 적용하면 활성화됩니다.
미적용이면 함수가 자동으로 레이트리밋을 건너뜁니다(graceful).

```bash
npx supabase db push          # supabase/migrations/0001_rate_limits.sql 적용
# 또는 대시보드 → SQL Editor 에 0001_rate_limits.sql 내용 붙여넣기
```
- 한도 조정: `supabase/functions/judge-luggage/index.ts`의 `RATE_MAX` / `RATE_WINDOW`.
- 이미지 크기 상한도 내장(`MAX_IMAGE_CHARS`).

## (선택) 향후
- 익명 로그인 + verify_jwt로 인증 강화.
- 규정 캐싱: `regulations` 테이블 시드 후 함수에서 우선 조회 → Claude는 보강용.
