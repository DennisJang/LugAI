-- P4 플라이휠: feedback를 자기충족적으로 (별도 scans 로깅 없이도 분석 가능)
-- 적용: supabase db push  (0002 다음). 사용자 정정은 명시적 행동이라 익명·동의 기반.
-- PII·이미지 미저장: anon_id(랜덤)·도착지·물품명·판정만.

alter table public.feedback add column if not exists anon_id text;
alter table public.feedback add column if not exists dest_code text;
alter table public.feedback add column if not exists ai_verdict text;

create index if not exists feedback_dest_idx on public.feedback (dest_code);
create index if not exists feedback_created_idx on public.feedback (created_at);
