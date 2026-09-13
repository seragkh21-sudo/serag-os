-- Applied to the existing Supabase project as creative_workspace_sessions.
-- Media stays in the existing private serag-attachments bucket (50 MiB per file).
create table public.creative_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.creative_projects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  document jsonb not null default '{"nodes":[],"edges":[],"assets":[],"viewport":{"x":80,"y":80,"zoom":1}}'::jsonb,
  revision integer not null default 0 check (revision >= 0),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creative_session_document check (
    document ?& array['nodes','edges','assets'] and
    jsonb_typeof(document) = 'object' and
    jsonb_typeof(document->'nodes') = 'array' and
    jsonb_typeof(document->'edges') = 'array' and
    jsonb_typeof(document->'assets') = 'array' and
    jsonb_array_length(document->'nodes') <= 500 and
    octet_length(document::text) <= 2097152
  )
);
create index creative_sessions_owner_updated on public.creative_sessions(user_id, archived, updated_at desc);
create index creative_sessions_project on public.creative_sessions(project_id);
alter table public.creative_sessions enable row level security;
revoke all on public.creative_sessions from anon, authenticated;
grant select, insert, update, delete on public.creative_sessions to authenticated;
create policy creative_sessions_read on public.creative_sessions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy creative_sessions_create on public.creative_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id and (project_id is null or exists (
    select 1 from public.creative_projects p where p.id = project_id and p.user_id = (select auth.uid())
  )));
create policy creative_sessions_update on public.creative_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (project_id is null or exists (
    select 1 from public.creative_projects p where p.id = project_id and p.user_id = (select auth.uid())
  )));
create policy creative_sessions_delete on public.creative_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);
