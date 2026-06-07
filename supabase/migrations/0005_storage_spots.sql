-- 짐 보관소(Luggage Storage) — 자체 큐레이션 + 커뮤니티 제보 + OSM 보강.
-- 경쟁사(Bounce/Stasher/Radical)는 양면 마켓플레이스라 공개 API가 없고, OSM은 희박(전세계 ~1.7천).
-- 그래서 우리가 큐레이션하고 사용자 제보로 신선도를 유지(= 경쟁사 약점 'stale data' 공략).
-- 적용: supabase db push (0004 다음). RLS: 클라이언트 직접 접근 차단, Edge Function(service_role)만.

create table if not exists public.storage_spots (
  id bigint generated always as identity primary key,
  name text not null,
  name_en text,
  kind text not null default 'shop',        -- 'locker' | 'staffed' | 'shop'
  lat double precision not null,
  lng double precision not null,
  city text,
  country_code text,                          -- ISO-2
  address text,
  hours text,                                -- 자유서식 "09:00–22:00" | "24h"
  price_text text,                           -- 자유서식 "₩5,000/일" (v1)
  source text not null default 'curated',    -- 'curated' | 'osm' | 'community'
  verified_at timestamptz default now(),     -- "최근 확인됨"(신선도)
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists storage_spots_geo_idx on public.storage_spots (lat, lng);
create index if not exists storage_spots_country_idx on public.storage_spots (country_code);

-- 신선도 플라이휠: 폐업/이전/오류 제보 (P4 feedback 패턴 재활용)
create table if not exists public.storage_reports (
  id bigint generated always as identity primary key,
  spot_id bigint references public.storage_spots(id) on delete set null,
  anon_id text,
  issue text not null,                       -- 'closed'|'moved'|'wrong_price'|'wrong_hours'|'other'
  note text,
  created_at timestamptz not null default now()
);
create index if not exists storage_reports_spot_idx on public.storage_reports (spot_id);

alter table public.storage_spots enable row level security;
alter table public.storage_reports enable row level security;

-- 반경 내 보관소(바운딩박스 선필터 + 하버사인 정렬). PostGIS 불필요.
-- 한계: 경도 바운딩박스가 ±180°(날짜변경선)을 래핑하지 않음 — 현재 시드(KR/JP)엔 무해.
--      태평양(피지/뉴질랜드 동단/180°자오선) 커버리지 확장 시 OR 분기로 날짜변경선 처리 필요.
create or replace function public.nearby_storage(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 3,
  p_limit int default 60
)
returns table (
  id bigint, name text, name_en text, kind text, lat double precision, lng double precision,
  city text, country_code text, address text, hours text, price_text text, source text,
  verified_at timestamptz, distance_km double precision
)
language sql stable
as $$
  select s.id, s.name, s.name_en, s.kind, s.lat, s.lng, s.city, s.country_code, s.address,
         s.hours, s.price_text, s.source, s.verified_at,
         6371 * 2 * asin(sqrt(
           power(sin(radians(s.lat - p_lat) / 2), 2) +
           cos(radians(p_lat)) * cos(radians(s.lat)) * power(sin(radians(s.lng - p_lng) / 2), 2)
         )) as distance_km
  from public.storage_spots s
  where s.active
    and s.lat between p_lat - (p_radius_km / 111.0) and p_lat + (p_radius_km / 111.0)
    and s.lng between p_lng - (p_radius_km / (111.0 * cos(radians(p_lat))))
                 and p_lng + (p_radius_km / (111.0 * cos(radians(p_lat))))
  order by distance_km asc
  limit p_limit;
$$;

-- ── 시드(일러스트레이션용 큐레이션 — 좌표는 실제 역/번화가, 시간·요금은 검증 전 예시).
--    실제 운영 큐레이션은 docs/STORAGE.md 절차로 보강. source='curated'.
insert into public.storage_spots (name, name_en, kind, lat, lng, city, country_code, hours, price_text) values
  ('서울역 코인락커', 'Seoul Station Lockers', 'locker', 37.5547, 126.9707, 'Seoul', 'KR', '04:30–01:30', '₩3,000–6,000/일'),
  ('명동 짐보관', 'Myeongdong Bag Storage', 'staffed', 37.5636, 126.9850, 'Seoul', 'KR', '09:00–22:00', '₩5,000/일'),
  ('홍대입구역 코인락커', 'Hongdae Station Lockers', 'locker', 37.5572, 126.9245, 'Seoul', 'KR', '05:30–24:00', '₩2,000–5,000/일'),
  ('東京駅 コインロッカー', 'Tokyo Station Lockers', 'locker', 35.6812, 139.7671, 'Tokyo', 'JP', '24h', '¥400–800/day'),
  ('新宿駅 手荷物預かり', 'Shinjuku Bag Storage', 'staffed', 35.6896, 139.7006, 'Tokyo', 'JP', '08:00–21:00', '¥600/day'),
  ('渋谷駅 コインロッカー', 'Shibuya Station Lockers', 'locker', 35.6580, 139.7016, 'Tokyo', 'JP', '24h', '¥400–700/day'),
  ('難波駅 コインロッカー', 'Namba Station Lockers', 'locker', 34.6659, 135.5010, 'Osaka', 'JP', '24h', '¥400–700/day'),
  ('梅田 手荷物預かり', 'Umeda Bag Storage', 'staffed', 34.7025, 135.4959, 'Osaka', 'JP', '09:00–21:00', '¥600/day')
on conflict do nothing;
