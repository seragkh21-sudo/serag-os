-- Private pronunciation recordings. Archive preserves audio and can be undone.
create table public.english_voice_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  practice_text text not null default '' check (char_length(practice_text) <= 20000),
  transcript text not null default '' check (char_length(transcript) <= 20000),
  notes text not null default '' check (char_length(notes) <= 10000),
  language text not null default 'en-US' check (language in ('en-US','en-GB')),
  storage_path text not null unique,
  audio_name text not null check (char_length(audio_name) <= 200),
  audio_mime_type text not null check (audio_mime_type like 'audio/%' or audio_mime_type='video/webm'),
  audio_bytes integer not null check (audio_bytes between 1 and 52428800),
  archived boolean not null default false,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path like user_id::text || '/voice/' || id::text || '/%')
);
create index english_voice_owner_created_idx on public.english_voice_recordings(user_id, created_at desc);
alter table public.english_voice_recordings enable row level security;
revoke all on public.english_voice_recordings from anon, authenticated;
grant select, insert on public.english_voice_recordings to authenticated;
grant update(title, practice_text, transcript, notes, language, archived) on public.english_voice_recordings to authenticated;
create policy english_voice_select on public.english_voice_recordings for select to authenticated
  using ((select auth.uid()) = user_id);
create policy english_voice_insert on public.english_voice_recordings for insert to authenticated
  with check ((select auth.uid()) = user_id and revision=0);
create policy english_voice_update on public.english_voice_recordings for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create function public.bump_english_voice_revision() returns trigger language plpgsql set search_path='' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.bump_english_voice_revision() from public, anon, authenticated;
create trigger english_voice_revision before update on public.english_voice_recordings
  for each row execute function public.bump_english_voice_revision();
