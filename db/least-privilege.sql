begin;

-- SERAG OS has no anonymous data surface. Authentication pages only use Auth.
revoke all on all tables in schema public from public, anon;
revoke all on all sequences in schema public from public, anon;
revoke all on all functions in schema public from public, anon;

-- The installed Android widgets intentionally use high-entropy capability tokens
-- after an authenticated device registration. These are the only anonymous RPCs.
grant execute on function public.widget_snapshot(text) to anon, authenticated;
grant execute on function public.widget_add_water(text, integer) to anon, authenticated;
grant execute on function public.register_widget_device(text) to authenticated;
grant execute on function public.consume_api_quota(text, integer) to authenticated;

alter function public.register_widget_device(text) set search_path = '';
alter function public.widget_snapshot(text) set search_path = '';
alter function public.widget_add_water(text, integer) set search_path = '';

-- The quota table is deliberately unreachable; this policy documents that fact
-- and keeps database security advisors from treating it as accidental.
drop policy if exists api_usage_no_direct_access on serag_private.api_usage;
create policy api_usage_no_direct_access on serag_private.api_usage
for all to authenticated using (false) with check (false);

create index if not exists widget_devices_user_id_idx
on public.widget_devices(user_id);

-- New public objects start closed and must be granted deliberately.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from public, anon;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from public, anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon;

commit;
