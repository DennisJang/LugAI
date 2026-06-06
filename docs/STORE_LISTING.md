# LugAI — 앱스토어 / 플레이스토어 등록 정보

> 제출 시 그대로 복사해 사용. 개인정보처리방침 URL은 `docs/legal/privacy.html` 호스팅 후 입력.

## 기본 정보
- **앱 이름**: LugAI
- **부제 (iOS Subtitle, ≤30자)**: 사진으로 끝내는 짐 규정 체크
- **카테고리**: 여행 (Travel)
- **연령 등급**: 4+ / 전체 이용가 (유해 콘텐츠 없음)
- **가격**: 무료
- **번들 ID / 패키지**: `com.lugai.app`
- **지원 이메일**: support@lugai.app *(실제 운영 이메일로 교체 필요)*
- **개인정보처리방침 URL**: _호스팅 후 입력_

## 프로모션 텍스트 (iOS, ≤170자)
여행 가기 전, 짐을 펼쳐놓고 사진 한 장만 찍으세요. 나라별 기내·위탁·금지 규정을 AI가 한눈에 정리해드려요.

## 설명 (한국어)
여행 짐 쌀 때마다 헷갈리는 반입 규정, 이제 사진 한 장으로 끝내세요.

LugAI는 도착지를 고르고 짐을 촬영하면, AI가 물품을 인식해 나라별 항공·세관 규정으로 자동 판정해드리는 여행 필수 앱입니다.

• 사진 한 장으로 물품별 판정 — 기내 OK / 기내만 / 위탁만 / 반입 금지
• 액체 100ml 룰, 보조배터리, 날붙이, 라이터, 식품 검역까지 한눈에
• 나라별 예외 규정 자동 반영
• 탭하면 "왜 안 되는지"와 실제 사례까지
• 여행별로 결과 저장 — 다음 출국 때 다시 확인

여행이 처음인 분도, 자주 다니는 디지털 노마드도. 공항에서 압수당하기 전에 LugAI로 미리 확인하세요.

※ 판정 결과는 참고용입니다. 최종 반입 여부는 항공사·해당 국가 규정을 확인하세요.

## 키워드 (iOS, ≤100자)
여행,짐싸기,수하물,기내반입,위탁수하물,항공규정,캐리어,세관,액체100ml,보조배터리,여행준비,체크리스트,출국

---

## English
- **Name**: LugAI
- **Subtitle**: Pack smart — check rules by photo
- **Description**:
Stop guessing what you can pack. Pick your destination, snap one photo of your bag, and LugAI's AI identifies each item and checks it against that country's air-travel and customs rules.

• One photo → per-item verdict: Carry-on OK / Cabin-only / Checked-only / Prohibited
• Covers liquids (100ml), power banks, blades, lighters, food quarantine, and more
• Country-specific exceptions applied automatically
• Tap any item for the "why" and real cabin/customs cases
• Save results per trip for next time

For first-time travelers and digital nomads alike — check before you get stopped at security.

Note: Results are for reference only. Always confirm with your airline and destination authorities.
- **Keywords**: travel,luggage,packing,carry-on,baggage,customs,liquids,power bank,airport,checklist,TSA

---

## 데이터 안전성 / 개인정보 라벨 (제출 폼 답변)
- **계정**: 없음 (로그인 불필요)
- **수집·저장 데이터**: 서버 저장 없음. 여행 기록은 **기기 로컬에만** 저장.
- **사진**: 짐 분석을 위해 일시 전송 → 처리 후 **미저장**. (목적: 앱 기능 / 사용자 식별과 연결 안 됨)
- **제3자 처리자**: Anthropic (Claude AI, 사진 분석)
- **추적(Tracking)**: 없음 / **광고**: 없음 / **애널리틱스**: 없음
- **권한**: 카메라(촬영), 사진 라이브러리(앨범 선택)
- iOS `ITSAppUsesNonExemptEncryption`: false (표준 HTTPS만 사용)

## 스크린샷 캡처 목록 (폰 전용, 6.7"/6.5" 등)
1. 홈 (도착지 + 스캔 히어로 + 예시 판정)
2. 결과 화면 (그룹 판정 + 펼친 상세)
3. 둘러보기 (압수 사례)
4. 내 여행 (저장된 여행)
5. 카메라 (스캔 가이드)
→ `docs/screenshots/`에 QA 중 캡처본 저장.

## 앱 심사 메모 (App Review Notes)
- 로그인 불필요. 게스트로 모든 기능 사용 가능.
- 데모 경로: 홈 → "스캔 시작" → 카메라 또는 "앨범에서 선택" → 분석 → 결과.
- 시뮬레이터엔 카메라가 없으므로 "앨범에서 선택"으로 테스트 권장.
- AI 판정은 정보 제공용이며 면책 고지(이용약관·결과 화면)에 명시.
- AI 백엔드(Claude) 키 미설정 시 앱은 안전하게 mock 결과로 폴백(크래시 없음).
