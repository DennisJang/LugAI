-- 규정 코퍼스 + 데이터 플라이휠 골격 (P3)
-- 적용: supabase db push  (또는 대시보드 SQL 편집기에 붙여넣기)
-- pgvector는 모든 Supabase 프로젝트에서 사용 가능. 임베딩은 embed-corpus EF가 백필.
-- 미적용 시 judge-luggage는 정적 grounding(앱이 보낸 regulations.ts)으로 graceful 폴백.

create extension if not exists vector with schema extensions;

-- 전 세계 공통(일반) 규정 — 권위 baseline. 런타임 grounding 소스.
create table if not exists public.reg_rules (
  id bigint generated always as identity primary key,
  category text not null,          -- liquids/powerbank/blade/lighter/vape/powder/food/flammable
  item_key text not null,
  locale text not null default 'en',
  verdict text not null,           -- success/warning/danger/info
  badge text not null,
  body text not null,
  source text not null,
  embedding vector(384),           -- gte-small (384d); NULL이면 embed-corpus가 백필
  updated_at timestamptz not null default now()
);

-- 국가별 특이 규정.
create table if not exists public.country_rules (
  id bigint generated always as identity primary key,
  code text not null,              -- ISO-2 도착지
  item_key text not null,
  locale text not null default 'en',
  verdict text not null,
  body text not null,
  source text not null,
  embedding vector(384),
  updated_at timestamptz not null default now()
);

-- 동의어/다국어 → item_key 매칭 (식별 보강).
create table if not exists public.item_aliases (
  id bigint generated always as identity primary key,
  alias text not null,
  item_key text not null
);

-- 익명 스캔 로깅(옵트인) — PII·이미지 미저장. 플라이휠 입력.
create table if not exists public.scans (
  id bigint generated always as identity primary key,
  anon_id text,
  dest_code text,
  items_jsonb jsonb,
  created_at timestamptz not null default now()
);

-- 사용자 정정/실제 통과여부 — 오판 패턴 발견.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  scan_id bigint references public.scans(id) on delete set null,
  item_key text,
  user_verdict text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists country_rules_code_idx on public.country_rules (code);
create index if not exists item_aliases_alias_idx on public.item_aliases (alias);
create index if not exists scans_created_idx on public.scans (created_at);
-- 벡터 유사도 인덱스(코사인). 코퍼스가 커지면 per-item 시맨틱 검색에 사용.
create index if not exists reg_rules_embedding_idx on public.reg_rules using hnsw (embedding vector_cosine_ops);
create index if not exists country_rules_embedding_idx on public.country_rules using hnsw (embedding vector_cosine_ops);

-- RLS: 클라이언트 직접 접근 차단. EF는 service_role로 접근(RLS 우회).
alter table public.reg_rules enable row level security;
alter table public.country_rules enable row level security;
alter table public.item_aliases enable row level security;
alter table public.scans enable row level security;
alter table public.feedback enable row level security;

-- 벡터 top-k 검색 RPC (baseline 코퍼스). filter_dest는 향후 country 결합용 예약.
create or replace function public.match_regulations(
  query_embedding vector(384),
  match_count int default 5
)
returns table (id bigint, category text, item_key text, body text, source text, similarity float)
language sql stable
security definer
set search_path = public, extensions
as $$
  select r.id, r.category, r.item_key, r.body, r.source,
         1 - (r.embedding <=> query_embedding) as similarity
  from public.reg_rules r
  where r.embedding is not null
  order by r.embedding <=> query_embedding
  limit match_count;
$$;

-- ── 시드: regulations.ts BASELINE + COUNTRY_NOTES (en). 임베딩은 NULL → embed-corpus 백필.
--    regulations.ts가 authored source. 규정 변경 시 이 시드도 갱신(후속: sync 스크립트).
insert into public.reg_rules (category, item_key, verdict, badge, body, source) values
  ('liquids','liquids','warning','≤100ml','Liquids, gels, aerosols — Cabin: 100ml or less per container in a 1L clear bag. Anything larger goes in checked baggage.','ICAO / TSA 3-1-1 / EU'),
  ('powerbank','powerbank','warning','Cabin only','Power banks / lithium batteries — Banned from checked bags, cabin only. Up to 100Wh is fine; 100-160Wh needs airline approval.','IATA'),
  ('blade','blade','warning','Checked only','Knives & blades — Not allowed in the cabin; checked baggage only.','ICAO / TSA'),
  ('lighter','lighter','danger','1 in cabin','Lighter — Banned from checked bags. Only one per person may be carried on.','ICAO / FAA'),
  ('vape','vape','warning','Cabin only','E-cigarettes / vapes — Banned from checked bags, cabin only. No use/charging onboard. Some countries ban them entirely.','IATA'),
  ('powder','powder','info','Extra screening','Powders — Powders over 350g/350ml may be subject to extra security screening.','TSA'),
  ('food','food','info','Declare','Food & produce — Subject to destination quarantine/customs. Meat, fruit, and seeds are often restricted; declare them.','도착지 세관·검역'),
  ('flammable','flammable','danger','Prohibited','Flammable / compressed gas — Butane, flammable sprays, etc. are banned in both cabin and checked baggage.','IATA DGR')
on conflict do nothing;

insert into public.country_rules (code, item_key, verdict, body, source) values
  ('JP','meat','danger','Meat import restrictions — Meat products like ham and sausage are strictly restricted (animal quarantine).','일본 동물검역소'),
  ('JP','dutyfree_liquid','warning','Duty-free liquids on transfer — On transfer, duty-free liquids not in a sealed STEB bag may be confiscated.','국토교통성'),
  ('US','liquids','warning','TSA 3-1-1 — Liquids must be 3.4oz (100ml) or less, in one quart-size bag.','TSA'),
  ('US','food','info','Agricultural declaration — Fruit, meat, and plants must be declared (USDA). Fines apply for non-declaration.','USDA / CBP'),
  ('AU','food','danger','Very strict biosecurity — You must declare all food, plants, wood, and seeds. Heavy fines/seizure if undeclared.','호주 농업부(DAFF)'),
  ('NZ','food','danger','Very strict biosecurity — Declare all food and natural items. Instant $400 fine if undeclared.','뉴질랜드 MPI'),
  ('EU','liquids','warning','100ml liquids — The EU-wide 100ml liquid rule applies.','EU'),
  ('EU','food','danger','Meat & dairy — Personal imports of meat/dairy from outside the EU are generally banned.','EU 집행위'),
  ('FR','liquids','warning','Liquids & meat rules — Same as EU (100ml liquids, non-EU meat/dairy restricted).','EU'),
  ('CN','powerbank','warning','Power bank marking — Power banks without clear capacity marking/certification are confiscated.','CAAC'),
  ('GB','liquids','warning','100ml liquids — Some airports are relaxing this with new scanners, but 100ml is the default.','UK CAA'),
  ('AE','medication','info','Medication caution — Some medications and items like poppy seeds are restricted. Carry prescriptions.','UAE 당국'),
  ('TH','vape','danger','E-cigarettes banned — Thailand makes bringing in or possessing e-cigarettes illegal (risk of fines/detention).','태국 관세청'),
  ('VN','dutyfree','info','Duty-free limits — Declare alcohol/tobacco that exceeds duty-free limits.','베트남 관세청')
on conflict do nothing;
