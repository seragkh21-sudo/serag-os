-- Applied via engoplay_word_review_preferences. Owner-only word review scheduling.
create table public.engoplay_word_reviews (
 user_id uuid not null references auth.users(id) on delete cascade,
 word_key text not null check(char_length(word_key) between 1 and 100),
 last_rating smallint not null check(last_rating in (1,2,3)),
 interval_days smallint not null check(interval_days between 1 and 90),
 due_at timestamptz not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,word_key)
);
alter table public.engoplay_word_reviews enable row level security;
revoke all on public.engoplay_word_reviews from anon,authenticated;
grant select,insert,update on public.engoplay_word_reviews to authenticated;
create policy engoplay_word_read on public.engoplay_word_reviews for select to authenticated using((select auth.uid())=user_id);
create policy engoplay_word_insert on public.engoplay_word_reviews for insert to authenticated with check((select auth.uid())=user_id);
create policy engoplay_word_update on public.engoplay_word_reviews for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
