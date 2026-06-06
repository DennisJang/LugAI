# LugAI 정밀도 아키텍처 (리서치 + 설계 + 구현) — 진행중

_작성: 2026-06-06 / 갱신: 2026-06-07 / 상태: P2·P5 구현 완료, P3 골격(코드/SQL) 완료·배포 대기. 작업 #25._

> 방향(사용자): 모델만 키우지 말고 → **레퍼런스 조사 → 케이스 분류 → 본질 도출 → 목적 최적 파이프라인 설계 → 자체 RAG(쓸수록 정밀↑ 데이터 플라이휠)**.

## 1. 리서치 요약 (근거)
- **Yuka**: 순수 비전이 아니라 **바코드 → DB 매칭**(Scandit SDK). 주요 포장식품 인식률 90%+. → 정확도는 *구조화된 DB 조회*에서 나옴.
- **Google Lens**: CNN + **OCR** + 지식그래프 + **DB 피처 매칭**. "**DB가 클수록 인식률↑**".
- **RAG**: 환각을 최대 ~50% 감소(Meta). 프로덕션급(<1%)은 **검색 grounding + 출처 인용 + 신뢰도 점수 + 도메인 검증**의 다층 조합.
- **Citation grounding / domain-grounded tiered retrieval**: 모델이 *검색된 vetted 코퍼스에서만* 인용하도록 강제 → 규제/컴플라이언스 도메인 환각 급감.
- 출처: Yuka×Scandit 케이스스터디, Zilliz(Google Lens 기술), arXiv(citation grounding 2606.00898 / hybrid retrieval 2512.12117 / tiered retrieval 2603.17872), Meta RAG.

→ **결론: LLM 단독 시각 추측 금지. "식별(+OCR) → 권위 DB 검색(RAG) → 검색 근거로 판정·인용 → 신뢰도/재촬영"** 이 정답.

## 2. LugAI의 본질 (essence)
- 가치 = **물품 × 도착지** 조합의 **정확하고 출처 있는 반입 판정**. 화려함이 아니라 *틀리지 않는 것* + *왜인지 신뢰*.
- 실패 비용이 큼(압수·벌금). → **보수적 판정 + 출처 + "최종 확인" 디스클레이머**가 신뢰의 핵심.
- 차별점: 파편화된 규정을 **한 장의 사진으로 통합 판정** + 쓸수록 정밀해지는 데이터.

## 3. 케이스 분류 (판정 결정 요인)
- **카테고리**: 액체/젤 · 리튬·배터리 · 날붙이 · 라이터/성냥 · 전자담배 · 분말 · 식품·농산물 · 의약품 · 인화성/압축가스 · 일반.
- **결정 요인(이게 정밀도의 축)**:
  1. **라벨 수치** — 용량(ml), 배터리(Wh/mAh). → **OCR 필수**.
  2. **수량** — 라이터 1개, 보조배터리 개수.
  3. **배치** — 기내 vs 위탁 vs 둘 다 vs 금지.
  4. **도착지 예외** — 검역(호주/뉴질랜드), 금지(태국 전자담배), 표기의무(중국 보조배터리).
  5. **경유/출발지** — (후속) 환승 규정.
- 판정 = (카테고리 식별) × (라벨/수량 OCR) × (도착지 규정 검색). 각 축을 분리해 정밀화.

## 4. 목적 최적 파이프라인 (설계)
```
1) 캡처(최적화)   : 1400px 리사이즈+압축 (구현됨). 흐림/저조도 가드(후속).
2) 비전 식별+OCR  : 물품 후보 + 라벨 수치(Wh/ml) 추출. 작은 글씨는 크롭/확대 판독.
3) RAG 검색       : (카테고리/물품 + 도착지) → 권위 규정 chunk 검색(pgvector).
4) 판정(grounded) : LLM은 *검색된 규정에 근거*해서만 판정 + source 인용. 임의 추정 금지.
5) 신뢰도         : 낮으면 "가까이 다시 찍기" 또는 info(확인 권장)로 보수 처리.
6) 결과+피드백    : 사용자가 정정/실제결과 입력 → 플라이휠(아래).
```
- 현재(`ai.ts`+Edge `judge-luggage`)는 4의 단순판 + `regulations.ts`의 정적 grounding(이미 적용). → 3을 **검색 기반**으로, 2에 **OCR 강조**로 고도화.
- 모델 티어: 기본 Sonnet, 애매/고위험은 Opus 승격(후속, 비용 trade-off).

## 5. 자체 RAG + 데이터 플라이휠 (쓸수록 정밀↑)
**코퍼스**: 큐레이션 시드(`regulations.ts`) + 권위 출처(IATA DGR, ICAO, TSA, 각국 세관/검역) → chunk + 임베딩.
**저장(Supabase pgvector)** — 스키마 초안:
- `reg_rules(id, category, item_key, locale, verdict, badge, body, source, embedding vector)`
- `country_rules(code, item_key, verdict, body, source, embedding)`
- `item_aliases(alias, item_key)` — 동의어/다국어 매칭
- `scans(id, anon_id, dest_code, items_jsonb, created_at)` — **익명, PII·이미지 미저장**
- `feedback(id, scan_id, item_key, user_verdict, note, created_at)` — 정정/실제결과
**검색→grounding**: Edge Function이 (물품·도착지) 임베딩으로 top-k 규정 검색 → 프롬프트에 주입(현 `groundingText` 정적 → 동적 검색으로 교체).
**플라이휠**:
1. 스캔/판정 **익명 로깅**(옵트인) → 빈출 물품·도착지 파악.
2. **사용자 정정/실제 통과여부** 수집 → 오판 패턴 발견.
3. 정정 누적 → (a) 규정 chunk 보강·수정, (b) few-shot 예시 풀, (c) `item_aliases` 확장, (d) 임계 도달 시 큐레이션/파인튜닝.
4. **eval 하니스**(라벨된 테스트셋)로 정밀도 회귀 측정 — 개선 수치화.
**프라이버시**: 이미지 미저장(현행 유지), 익명 ID, 옵트인, 개인정보처리방침 반영 필요(계정 도입 시 동기화 별도).

## 6. 단계 실행안
- **P1**(사용자): 실제 AI 배포(`docs/SUPABASE_SETUP.md`) — 측정 시작점. ⏳ 배포 대기.
- **P2** ✅: OCR 강조 프롬프트 + 항목별 `confidence`(low/medium/high) + 저확신·고위험 시 "가까이 다시 찍기" 루프. EF→`ai.ts`→`mockScan`→`ScanResultView`(4언어). 저확신은 verdict 다운그레이드 X(유지+주석). mock에서도 동작.
- **P3 골격** ✅(배포 대기): `0002_regulations_corpus.sql`(pgvector 코퍼스+RLS+시드+`match_regulations` RPC) + `embed-corpus` EF(gte-small 384d 백필) + `judge-luggage` 동적 grounding(정적 폴백). 코퍼스를 DB로 이전 → 앱 재배포 없이 규칙 수정.
- **P4**(다음): 결과 화면 "정정/실제 통과" 피드백 → `feedback` 테이블 → 플라이휠 v1. (테이블은 0002에 생성됨)
- **P5** ✅: eval 하니스(`src/lib/eval/`, 21 라벨 케이스 + 플러그블 predictor + 스코어러 + danger 안전 불변식). 결정적 규칙 레이어 회귀 net, 오프라인. 배포 후 `aiPredictor`로 전 파이프라인 정밀도 수치화.

## 7. 현재 코드 연결점
- `src/lib/regulations.ts` (시드) → P3에서 DB/임베딩으로 이전(시드는 유지).
- `src/lib/ai.ts` `groundingText`, `supabase/functions/judge-luggage/index.ts` → 정적→검색 grounding.
- `src/lib/mockScan.ts` → eval/플라이휠 라벨 케이스의 출발점으로 재활용 가능.

## 미완 / 다음 세션에서 이어갈 것
- **사용자 액션(P1 + P3 활성화)**: `docs/SUPABASE_SETUP.md`의 "🔑 정밀도(P3)" 섹션 — `db push`(0002) → `embed-corpus` 배포·백필 → `judge-luggage` 재배포 → `ANTHROPIC_API_KEY` 시크릿. 끝나면 라이브 경로 검증.
- **검증(배포 후)**: 실제 AI 응답에 `confidence`/`measurement` 반영 확인, 동적 grounding 로그 확인, DB 끊김 시 정적 폴백 확인, `aiPredictor`로 P5 정밀도 측정.
- **다음 구현**: P4 피드백 UI(정정/실제 통과 → `feedback`), 2-stage 시맨틱 검색(vision 식별→per-item `match_regulations` top-k→재판정), 모델 티어 승격(애매/고위험 Opus), 코퍼스 단일소스 sync 스크립트(`regulations.ts` ↔ 0002 시드).
