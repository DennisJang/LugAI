# 짐 보관소 (Luggage Storage)

스캔과 묶이는 차별화 기능. 경쟁사(Bounce/Stasher/Radical)는 **양면 마켓플레이스라 공개 API가 없고**,
OSM은 **전세계 ~1.7천개로 희박**하다는 리서치 결론에 따라 → **자체 큐레이션 + 커뮤니티 제보 + OSM 보강.**

## 차별화 (리서치 근거)
- **🔗 스캐너 ↔ 보관 브리지**: 스캔 결과에 '꼭 확인'(danger) 물품이 있으면 결과 화면에서 "근처 보관소에 맡기기" 노출. 아무도 안 하는 시너지.
- **✅ 신선도 우선**: 각 스팟에 "최근 확인됨" + 폐업/오류 **제보 플라이휠**(P4 패턴) → 경쟁사 1위 불만(stale data) 정조준.
- **🇰🇷 프리미엄 미니멀 지도 + 아시아**: 토종 약한 UX 공략.

## 구성요소
- `supabase/migrations/0005_storage_spots.sql` — `storage_spots`(POI) + `storage_reports`(제보) + `nearby_storage` RPC(하버사인) + RLS + 시드(서울/도쿄/오사카).
- `supabase/functions/nearby-storage` — 좌표→근처 보관소 조회. `report-storage` — 제보 적재. (둘 다 레이트리밋)
- 앱: `src/lib/storage.ts`, `src/app/storage.tsx`(리스트·필터·상세·제보), 홈 진입 카드, 결과 화면 브리지.
- 지도: `src/components/StorageMap.tsx`(rnmapbox) — **Expo Go 불가, 개발빌드 전용**(가드 처리, Expo Go에선 리스트만).

## 배포 (사용자)
```bash
npx supabase db push                                       # 0005 포함
npx supabase functions deploy nearby-storage --no-verify-jwt
npx supabase functions deploy report-storage --no-verify-jwt
```

## 🗺️ Mapbox 지도 (개발빌드 필요)
rnmapbox는 **Expo Go에서 안 됨** → EAS 개발빌드(또는 `npx expo run:ios`)에서만 지도가 렌더됨. 2개 토큰 필요:
1. **런타임(공개) 토큰** — `.env.local`에 `EXPO_PUBLIC_MAPBOX_TOKEN=pk....` (지도 타일 렌더).
2. **다운로드(비밀) 토큰** — `app.json`의 `@rnmapbox/maps` 플러그인을 객체 형태로 바꿔 빌드용 SDK 다운로드 토큰을 넣어야 빌드가 통과:
   ```json
   ["@rnmapbox/maps", { "RNMapboxMapsDownloadToken": "sk.<비밀 다운로드 토큰>" }]
   ```
   (현재는 bare 등록 — 개발빌드 전 위 형태로 교체. Expo Go는 플러그인 무시라 영향 없음.)
3. 빌드: `npx expo run:ios` 또는 `eas build -p ios --profile development` → 시뮬/기기에서 지도 확인.

> 토큰 없이/Expo Go에선 앱은 **리스트만** 정상 동작(graceful). 지도는 토큰+개발빌드에서 활성.

## 데이터 큐레이션 (신선도가 핵심 경쟁력)
- 시드(`0005`)는 좌표는 실제 역/번화가지만 **시간·요금은 검증 전 예시**. 운영 큐레이션으로 보강 필요.
- 추가/수정: `storage_spots`에 `source='curated'`로 INSERT, `verified_at`을 확인일로 갱신("최근 확인됨" 신선도).
- **OSM 보강(후속)**: Overpass로 `amenity=luggage_locker`/`left_luggage`를 bbox 조회해 `source='osm'`로 임포트하는 일회성 스크립트/EF 추가 가능(전세계 희박하므로 주요 도시 위주).
- **제보 활용**: `storage_reports`의 `closed`/`moved` 누적 시 해당 스팟 `active=false` 또는 재확인 → 신선도 유지.

## 향후
- 현위치(GPS, expo-location)로 "내 주변" — 현재는 목적지 도시 중심 앵커.
- 스팟 상세(사진·리뷰), 예약/결제(제휴 시), 도시 커버리지 확장.
