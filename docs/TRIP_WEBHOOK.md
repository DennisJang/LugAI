# 여행 자동 연동 (ingest-trip 웹훅)

예매(Trip.com·아고다·항공권 등) 확인 메일에서 **도착지·여행일자**를 받아 홈에 자동으로 띄우는 기능.

> **중요(정직):** LugAI는 Trip.com·아고다와 **직접 제휴 API가 없습니다.** 대신 사용자의 자동화 도구
> (Zapier·IFTTT·Make·애플 단축어)가 예매 메일을 파싱해 LugAI 웹훅으로 POST하는 구조입니다.
> 앱은 받은 정보만 사용하고, **개인정보·사진은 저장하지 않습니다**(연결코드·도착지·일자만).

## 구성요소
- `supabase/functions/ingest-trip` — 외부 자동화가 POST하는 수신 웹훅(레이트리밋 내장).
- `supabase/functions/fetch-trips` — 앱이 연결코드로 다가오는 여행 1건 조회.
- `supabase/migrations/0004_trip_inbox.sql` — `trip_inbox` 테이블(RLS, service_role 전용).
- 앱: 프로필 → **여행 자동 연동** 화면에서 웹훅 URL·연결코드 확인/공유. 홈에서 자동 표시.

## 배포 (사용자)
```bash
npx supabase db push                                          # 0004 포함
npx supabase functions deploy ingest-trip --no-verify-jwt
npx supabase functions deploy fetch-trips --no-verify-jwt
```

## 웹훅 규격
`POST {SUPABASE_URL}/functions/v1/ingest-trip`
헤더: `apikey: <ANON_KEY>`, `Authorization: Bearer <ANON_KEY>`, `content-type: application/json`

```json
{
  "connectCode": "anon-xxxx",   // 앱 프로필 → 여행 자동 연동의 '연결 코드'
  "destCode": "JP",             // ISO-2 국가코드 (필수)
  "startDate": "2026-06-12",    // YYYY-MM-DD (선택)
  "endDate": "2026-06-15",      // YYYY-MM-DD (선택)
  "source": "tripcom"           // 자유 라벨 (선택)
}
```
응답: `{ "ok": true }` / 검증 실패 400 / 레이트리밋 429.

## 자동화 레시피 예 (Zapier/Make)
1. **Trigger**: Gmail/Outlook — "Trip.com 예매 확인" 같은 검색식의 새 메일.
2. **Parse**: 메일 본문에서 도착 공항/도시 → 국가코드, 출발·도착일 추출(파서 스텝 또는 정규식).
3. **Action**: Webhooks → POST, 위 JSON. `connectCode`는 앱에서 복사한 연결 코드 고정값.

## 애플 단축어(간이)
"텍스트 받기 → 사전 만들기(connectCode/destCode/startDate/endDate) → URL 콘텐츠 가져오기(POST, JSON)".
공유시트에서 예매 메일을 단축어로 보내는 흐름도 가능.

## 동작/프라이버시
- 앱은 실행 시 `fetch-trips`로 연결코드 기준 **다가오는(또는 일자 미지정) 1건**을 가져와 도착지를 자동 설정.
- 연결코드(anonId)는 무작위·비식별. 노출 위험 낮음(스푸핑돼도 잘못된 도착지 제안 정도) + 레이트리밋.
- 미배포·오프라인 시 앱은 기존 수동 도착지 선택으로 정상 동작(graceful).
