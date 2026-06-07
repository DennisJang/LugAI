-- 여행 자동 연동: 예매(Trip.com·아고다·항공권 등) 일자를 외부 자동화(Zapier/단축어 등)가
-- ingest-trip 웹훅으로 보내 적재. 앱은 연결코드(anonId)로 fetch-trips를 통해 조회.
-- 적용: supabase db push  (0003 다음). PII·이미지 미저장: 연결코드·도착지·일자만.

create table if not exists public.trip_inbox (
  id bigint generated always as identity primary key,
  anon_id text not null,          -- 연결코드(앱의 anonId)
  dest_code text not null,        -- ISO-2 도착지
  start_date date,
  end_date date,
  source text,                    -- 'tripcom' | 'agoda' | 'email' 등 자유 라벨
  created_at timestamptz not null default now()
);

create index if not exists trip_inbox_anon_idx on public.trip_inbox (anon_id, created_at desc);

-- RLS: 클라이언트 직접 접근 차단. Edge Function이 service_role로만 접근.
alter table public.trip_inbox enable row level security;
