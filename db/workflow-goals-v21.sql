create table public.workflow_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 160),
 document jsonb not null default '{"tracks":[],"milestones":[],"details":{}}'::jsonb check(jsonb_typeof(document)='object'),
 revision integer not null default 0,
 updated_at timestamptz not null default now()
);
create index workflow_goals_owner on public.workflow_goals(user_id);
alter table public.workflow_goals enable row level security;
revoke all on public.workflow_goals from anon,authenticated;
grant select,insert,update on public.workflow_goals to authenticated;
create policy workflow_goals_read on public.workflow_goals for select to authenticated using((select auth.uid())=user_id);
create policy workflow_goals_insert on public.workflow_goals for insert to authenticated with check((select auth.uid())=user_id);
create policy workflow_goals_update on public.workflow_goals for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
