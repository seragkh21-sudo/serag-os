-- Private, user-owned article library for the English reading area.
create table public.english_reading_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  source_url text check (source_url is null or char_length(source_url) <= 2048),
  topic text not null default 'General' check (char_length(topic) <= 100),
  level text not null default 'B1' check (level in ('A1','A2','B1','B2','C1','C2')),
  tags text[] not null default '{}',
  summary text not null default '' check (char_length(summary) <= 600),
  content text not null default '' check (char_length(content) <= 200000),
  status text not null default 'unread' check (status in ('unread','reading','completed')),
  reading_progress integer not null default 0 check (reading_progress between 0 and 100),
  favorite boolean not null default false,
  notes text not null default '' check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint english_reading_articles_content_or_url check (char_length(btrim(content)) > 0 or source_url is not null)
);

create index english_reading_articles_owner_updated_idx
  on public.english_reading_articles (user_id, updated_at desc);
create index english_reading_articles_owner_status_idx
  on public.english_reading_articles (user_id, status, updated_at desc);
create index english_reading_articles_tags_idx
  on public.english_reading_articles using gin (tags);

alter table public.english_reading_articles enable row level security;
revoke all on public.english_reading_articles from anon, authenticated;
grant select, insert, update, delete on public.english_reading_articles to authenticated;

create policy english_reading_articles_own_rows
  on public.english_reading_articles
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_english_reading_articles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_english_reading_articles_updated_at() from public, anon, authenticated;

create trigger trg_english_reading_articles_updated_at
  before update on public.english_reading_articles
  for each row execute function public.set_english_reading_articles_updated_at();