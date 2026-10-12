-- Applied to the connected project via engoplay_identity_and_activity.
-- Additive identity and educational progress; existing records remain in place.
alter table public.profiles
  add column username text,
  add column avatar_id text not null default 'chick',
  add column onboarding_completed_at timestamptz,
  add column english_daily_goal smallint not null default 5,
  add column english_level text;
alter table public.profiles add constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,20}$');
alter table public.profiles add constraint profiles_avatar_choice check (avatar_id in ('chick','cat','panda','fox','bunny','bear'));
alter table public.profiles add constraint profiles_english_goal check (english_daily_goal in (5,8,12));
alter table public.profiles add constraint profiles_english_level check (english_level is null or english_level in ('B1','B2','C1','C2'));
alter table public.profiles add constraint profiles_identity_complete check (onboarding_completed_at is null or (username is not null and char_length(btrim(display_name)) between 2 and 24));
create unique index profiles_username_unique on public.profiles (lower(username)) where username is not null;

create table public.engoplay_activity (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 activity_date date not null,
 question_key text not null check (char_length(question_key) between 1 and 160),
 topic text not null default 'practice' check (char_length(topic) <= 100),
 correct boolean not null,
 selected_answer text not null default '' check (char_length(selected_answer) <= 1000),
 daily_goal smallint not null default 5 check (daily_goal in (5,8,12)),
 learned_at timestamptz not null default now(),
 xp smallint generated always as (case when correct then 10 else 3 end) stored,
 created_at timestamptz not null default now(),
 constraint engoplay_activity_once unique(user_id,activity_date,question_key)
);
create index engoplay_activity_owner_learned on public.engoplay_activity(user_id,learned_at desc);
alter table public.engoplay_activity enable row level security;
revoke all on public.engoplay_activity from anon,authenticated;
grant select,insert,update on public.engoplay_activity to authenticated;
create policy engoplay_read on public.engoplay_activity for select to authenticated using ((select auth.uid())=user_id);
create policy engoplay_add on public.engoplay_activity for insert to authenticated with check ((select auth.uid())=user_id and activity_date <= (now() at time zone 'Africa/Cairo')::date);

-- Update permission applied separately via engoplay_corrected_answers.
create policy engoplay_update on public.engoplay_activity for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and activity_date <= (now() at time zone 'Africa/Cairo')::date);

create function public.get_engoplay_days()
returns table(activity_date date,answers bigint,correct bigint,xp bigint,daily_goal integer)
language sql stable security invoker set search_path = public,auth
as $$
 select a.activity_date,count(*),count(*) filter(where a.correct),sum(a.xp),
        ((array_agg(a.daily_goal order by a.learned_at,a.id))[1])::integer
 from public.engoplay_activity a where a.user_id=(select auth.uid())
 group by a.activity_date order by a.activity_date
$$;
revoke execute on function public.get_engoplay_days() from public,anon;
grant execute on function public.get_engoplay_days() to authenticated;

-- Preserve real historical quiz participation, at most one record per question/day.
insert into public.engoplay_activity(user_id,activity_date,question_key,topic,correct,selected_answer,learned_at)
select distinct on (user_id,attempt_date,md5(lower(btrim(prompt))))
 user_id,attempt_date,'legacy:'||md5(lower(btrim(prompt))),left(coalesce(section,'practice'),100),
 is_correct,left(coalesce(selected_answer,''),1000),(attempt_date::timestamp+interval '12 hours') at time zone 'Africa/Cairo'
from public.english_quiz_attempts
where user_id is not null and attempt_date <= (now() at time zone 'Africa/Cairo')::date
order by user_id,attempt_date,md5(lower(btrim(prompt))),created_at
on conflict(user_id,activity_date,question_key) do nothing;
