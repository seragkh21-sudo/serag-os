-- Track prompts shown to a learner so unopened/restarted sessions rotate across devices.
-- Exposure rows are intentionally separate from engoplay_activity: seeing a prompt
-- never counts as an answer, XP, or daily-streak progress.
create table public.engoplay_question_exposures (
 user_id uuid not null references auth.users(id) on delete cascade,
 question_key text not null check(char_length(question_key) between 1 and 160),
 shown_at timestamptz not null default now(),
 primary key(user_id,question_key)
);

alter table public.engoplay_question_exposures enable row level security;
revoke all on public.engoplay_question_exposures from anon,authenticated;
grant select,insert,update on public.engoplay_question_exposures to authenticated;
create policy engoplay_exposures_read on public.engoplay_question_exposures
 for select to authenticated using((select auth.uid())=user_id);
create policy engoplay_exposures_insert on public.engoplay_question_exposures
 for insert to authenticated with check((select auth.uid())=user_id);
create policy engoplay_exposures_update on public.engoplay_question_exposures
 for update to authenticated using((select auth.uid())=user_id)
 with check((select auth.uid())=user_id);
