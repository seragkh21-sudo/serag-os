-- Existing Supabase store; counters cannot be read, reset or deleted by clients.
begin;
create schema if not exists serag_private;
revoke all on schema serag_private from public, anon;
grant usage on schema serag_private to authenticated;
create table if not exists serag_private.api_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null, period text not null, window_start timestamptz not null,
 requests integer not null default 0, units integer not null default 0,
 primary key(user_id,action,period)
);
alter table serag_private.api_usage enable row level security;
revoke all on serag_private.api_usage from public,anon,authenticated;
create or replace function serag_private.consume_api_quota(p_action text,p_units integer default 1)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); t timestamptz:=now(); minute_start timestamptz:=date_trunc('minute',now());
 day_start timestamptz:=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
 minute_limit integer; day_limit integer; unit_limit integer; m serag_private.api_usage; d serag_private.api_usage;
begin
 if u is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_action is null or p_action not in ('tts','assistant','english-coach') or p_units is null or p_units<1 or p_units>5000 then raise exception 'invalid quota request'; end if;
 minute_limit:=case p_action when 'tts' then 20 else 6 end;
 day_limit:=case p_action when 'tts' then 150 when 'assistant' then 30 else 50 end;
 unit_limit:=case p_action when 'tts' then 15000 else day_limit end;
 if p_action<>'tts' and p_units<>1 then raise exception 'invalid units'; end if;
 -- Serialize both windows for this identity, including concurrent server instances.
 perform pg_advisory_xact_lock(hashtextextended(u::text||':'||p_action,0));
 insert into serag_private.api_usage values(u,p_action,'minute',minute_start,0,0),(u,p_action,'day',day_start,0,0) on conflict do nothing;
 update serag_private.api_usage set window_start=case period when 'minute' then minute_start else day_start end,requests=0,units=0
 where user_id=u and action=p_action and window_start<>case period when 'minute' then minute_start else day_start end;
 select * into m from serag_private.api_usage where user_id=u and action=p_action and period='minute';
 select * into d from serag_private.api_usage where user_id=u and action=p_action and period='day';
 if d.requests>=day_limit or d.units+p_units>unit_limit then return jsonb_build_object('allowed',false,'retry_after',ceil(extract(epoch from day_start+interval '1 day'-t))); end if;
 if m.requests>=minute_limit then return jsonb_build_object('allowed',false,'retry_after',ceil(extract(epoch from minute_start+interval '1 minute'-t))); end if;
 update serag_private.api_usage set requests=requests+1,units=units+p_units where user_id=u and action=p_action;
 return jsonb_build_object('allowed',true);
end $$;
revoke all on function serag_private.consume_api_quota(text,integer) from public,anon;
grant execute on function serag_private.consume_api_quota(text,integer) to authenticated;
create or replace function public.consume_api_quota(p_action text,p_units integer default 1)
returns jsonb language sql security invoker set search_path='' as $$ select serag_private.consume_api_quota(p_action,p_units); $$;
revoke all on function public.consume_api_quota(text,integer) from public,anon;
grant execute on function public.consume_api_quota(text,integer) to authenticated;
commit;
