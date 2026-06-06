-- judge-luggage Edge Function 레이트리밋용 테이블 + 함수
-- 적용: supabase db push  (또는 대시보드 SQL 편집기에 붙여넣기)
-- 미적용 시 함수는 graceful 하게 레이트리밋을 건너뜁니다.

create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_ip_time_idx on public.rate_limits (ip, created_at);

-- RLS: 클라이언트 직접 접근 차단(서비스 롤만 RPC로 사용)
alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(p_ip text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
begin
  -- 오래된 기록 정리
  delete from public.rate_limits
   where created_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into cnt
    from public.rate_limits
   where ip = p_ip
     and created_at > now() - make_interval(secs => p_window_seconds);

  if cnt >= p_max then
    return false;
  end if;

  insert into public.rate_limits(ip) values (p_ip);
  return true;
end;
$$;
