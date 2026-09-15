begin;
-- Preserve the existing capability-token widget API, but never transfer a token.
create or replace function public.register_widget_device(p_token text)
returns jsonb language plpgsql security definer set search_path='public' as $$
declare v_user uuid:=auth.uid(); v_hash text;
begin
 if v_user is null then raise exception 'authentication required'; end if;
 if p_token is null or length(p_token)<40 or length(p_token)>256 then raise exception 'invalid device token'; end if;
 v_hash:=encode(extensions.digest(p_token,'sha256'),'hex');
 insert into public.widget_devices(user_id,token_hash,revoked_at,last_used_at)
 values(v_user,v_hash,null,now())
 on conflict(token_hash) do update set last_used_at=now()
 where widget_devices.user_id=v_user and widget_devices.revoked_at is null;
 if not found then raise exception 'device token unavailable'; end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.register_widget_device(text) from public,anon;
grant execute on function public.register_widget_device(text) to authenticated;
-- A separate timestamp ensures background snapshot refreshes do not block a tap.
alter table public.widget_devices add column if not exists last_water_at timestamptz;
do $$ declare def text; begin
 select pg_get_functiondef('public.widget_add_water(text,integer)'::regprocedure) into def;
 def:=replace(def,'if p_amount not in (250, 500) then','if p_amount is null or p_amount not in (250, 500) then');
 def:=replace(def,'  insert into public.water_logs(user_id, amount_ml)',E'  update public.widget_devices set last_water_at=now()\n  where token_hash=v_hash and revoked_at is null\n    and (last_water_at is null or last_water_at < now()-interval ''2 seconds'');\n  if not found then raise exception ''Please wait before adding water again''; end if;\n\n  insert into public.water_logs(user_id, amount_ml)');
 execute def;
end $$;
commit;
