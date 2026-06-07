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

---

# 🔑 정밀도(P3) — 규정 코퍼스 + 동적 RAG grounding 활성화

정적 `regulations.ts` grounding을 **DB 코퍼스(pgvector)** 로 옮겨, 앱 재배포 없이 규정을
수정·확장(데이터 플라이휠)할 수 있게 합니다. **아래를 적용하기 전까지** judge-luggage는
요청에 실린 정적 grounding으로 자동 폴백하므로 앱은 그대로 동작합니다(graceful).

> 사용자가 미리 해둘 일 = **이 섹션 1~3단계**. 끝나면 알려주시면 라이브 경로를 검증합니다.

### 1) 코퍼스 스키마 + 시드 적용
```bash
npx supabase db push          # 0002_regulations_corpus.sql + 0003_feedback_columns.sql 적용
# 또는 대시보드 → SQL Editor 에 0002·0003 내용 붙여넣기
```
- `vector`(pgvector) 확장 활성 + `reg_rules`/`country_rules`/`item_aliases`/`scans`/`feedback` 테이블 생성.
- `regulations.ts`의 baseline·국가별 규정이 **텍스트로 시드**됩니다(임베딩은 NULL → 2단계에서 백필).
- 전부 RLS 활성(클라이언트 직접 접근 차단, Edge Function이 service_role로만 접근).

### 2) 임베딩 백필 함수 배포 + 1회 실행
```bash
npx supabase functions deploy embed-corpus --no-verify-jwt
# 백필 1회 호출 (URL/ANON은 .env.local의 EXPO_PUBLIC_* 값)
curl -X POST "$EXPO_PUBLIC_SUPABASE_URL/functions/v1/embed-corpus" \
     -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY"
# → {"embedded":{"reg_rules":8,"country_rules":14}} 이면 성공
```
- Supabase **내장 `gte-small`(384차원)** 사용 → 외부 임베딩 키 불필요.
- 멱등: 다시 호출해도 이미 채워진 행은 건너뜀.

### 3) judge-luggage 재배포 (동적 grounding 코드 반영)
```bash
npx supabase functions deploy judge-luggage --no-verify-jwt
```
- 이제 함수가 DB 코퍼스에서 grounding을 동적 생성합니다. DB/임베딩 미가용 시 정적 폴백.

### 확인
- 대시보드 SQL: `select count(*) from reg_rules where embedding is not null;` → 8.
- 규정 수정 테스트: `country_rules` 한 행을 수정 → 앱 재배포 없이 판정 grounding에 반영되는지.
- 벡터 검색 RPC `match_regulations(query_embedding, match_count)` 사용 가능(향후 per-item 시맨틱 검색용).

### 4) (P4) 피드백 수집 활성화
```bash
npx supabase functions deploy submit-feedback --no-verify-jwt
```
- 결과 화면에서 이용자가 "정확/정정"을 누르면 `feedback` 테이블에 익명 1행 적재(사진·PII 없음).
- 확인: `select dest_code, item_key, ai_verdict, user_verdict from feedback order by created_at desc limit 10;`
- 미배포 시 앱은 조용히 무시(피드백만 안 쌓임, UX 영향 없음).

---

## (선택) 향후
- 익명 로그인 + verify_jwt로 인증 강화.
- **플라이휠 분석**: `feedback`의 `ai_verdict` vs `user_verdict` 비교로 오판 패턴 → 규정 chunk 보강·few-shot·`item_aliases` 확장.
- **2-stage 검색**: vision 식별 → per-item `match_regulations` top-k → 재판정(정밀도↑, +1 호출).
