-- Additive private imports; originals, history and XP are never overwritten.
create function public.content_import_fingerprint(value text) returns text
language sql immutable strict set search_path='' as $$
 select encode(sha256(convert_to(btrim(regexp_replace(regexp_replace(lower(normalize(value,NFKC)), '_+', ' blank ', 'g'), '[^[:alnum:]]+', ' ', 'g')),'UTF8')),'hex')
$$;

create function public.valid_import_question(value jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare opt jsonb; seen text[] := '{}'; folded text;
begin
 if value is null or coalesce(jsonb_typeof(value),'')<>'object' or coalesce(jsonb_typeof(value->'prompt'),'')<>'string' or length(btrim(value->>'prompt')) not between 1 and 2000
 or coalesce(jsonb_typeof(value->'answer'),'')<>'string' or coalesce(jsonb_typeof(value->'options'),'')<>'array' then return false; end if;
 if jsonb_array_length(value->'options') not between 2 and 4 or coalesce(value->>'level','') not in ('B1','B2','C1','C2')
 or length(coalesce(value->>'topic','')) not between 1 and 100 or length(coalesce(value->>'explanation',''))>3000 then return false; end if;
 for opt in select * from jsonb_array_elements(value->'options') loop
  if jsonb_typeof(opt)<>'string' or length(btrim(opt#>>'{}')) not between 1 and 500 then return false; end if;
  folded := public.content_import_fingerprint(opt#>>'{}');
  if folded=any(seen) then return false; end if; seen:=array_append(seen,folded);
 end loop;
 return (value->'options') @> jsonb_build_array(value->>'answer');
exception when others then return false;
end $$;

create table public.english_imported_questions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 batch_id uuid not null,
 source_filename text not null check(length(source_filename) between 1 and 200),
 source_page integer check(source_page between 1 and 10000),
 data jsonb not null check(public.valid_import_question(data)),
 fingerprint text generated always as (public.content_import_fingerprint((data->>'prompt')||'|'||(data->>'answer'))) stored,
 prompt_key text generated always as (public.content_import_fingerprint(data->>'prompt')) stored,
 created_at timestamptz not null default now(),
 unique(user_id,fingerprint), unique(user_id,prompt_key)
);
create index english_imported_questions_owner_batch_idx on public.english_imported_questions(user_id,batch_id);
alter table public.english_imported_questions enable row level security;
revoke all on public.english_imported_questions from public,anon,authenticated;
grant select,insert,delete on public.english_imported_questions to authenticated;
create policy english_imported_questions_owner on public.english_imported_questions for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

alter table public.english_reading_articles
 add column import_batch_id uuid,
 add column import_source_filename text check(length(import_source_filename)<=200),
 add column import_source_page integer check(import_source_page between 1 and 10000),
 add column import_fingerprint text generated always as (case when import_batch_id is not null then public.content_import_fingerprint(content) end) stored;
create unique index english_reading_articles_import_unique on public.english_reading_articles(user_id,import_fingerprint) where import_fingerprint is not null;
create index english_reading_articles_owner_import_batch_idx on public.english_reading_articles(user_id,import_batch_id) where import_batch_id is not null;

create function public.commit_english_import(items jsonb,import_batch uuid,filename text,expected_owner uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare item jsonb; p jsonb; inserted integer; question_count integer:=0; article_count integer:=0; skipped integer:=0; owner_id uuid:=auth.uid();
begin
 if owner_id is null or owner_id is distinct from expected_owner then raise exception 'Account changed. Sign in again'; end if;
 if jsonb_typeof(items)<>'array' then raise exception 'Expected records'; end if;
 if jsonb_array_length(items) not between 1 and 500 or length(items::text)>3000000 or import_batch is null or length(btrim(filename)) not between 1 and 200 then raise exception 'Invalid import size or source'; end if;
 for item in select * from jsonb_array_elements(items) loop
  p:=item->'payload';inserted:=0;
  if item->>'kind'='question' then
   insert into public.english_imported_questions(user_id,batch_id,source_filename,source_page,data)
   values(owner_id,import_batch,filename,(item->>'source_page')::integer,p) on conflict do nothing;
   get diagnostics inserted=row_count;question_count:=question_count+inserted;
  elsif item->>'kind'='article' then
   if length(btrim(coalesce(p->>'content',''))) not between 20 and 200000 then raise exception 'Invalid article content'; end if;
   insert into public.english_reading_articles(user_id,title,content,level,topic,import_batch_id,import_source_filename,import_source_page)
   select owner_id,p->>'title',p->>'content',p->>'level',p->>'topic',import_batch,filename,(item->>'source_page')::integer
   where not exists(select 1 from public.english_reading_articles a where a.user_id=owner_id and public.content_import_fingerprint(a.content)=public.content_import_fingerprint(p->>'content'))
   on conflict (user_id,import_fingerprint) where import_fingerprint is not null do nothing;
   get diagnostics inserted=row_count;article_count:=article_count+inserted;
  else raise exception 'Unsupported content kind'; end if;
  if inserted=0 then skipped:=skipped+1;end if;
 end loop;
 return jsonb_build_object('questions',question_count,'articles',article_count,'skipped',skipped);
end $$;

create function public.undo_english_import(import_batch uuid,expected_owner uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare question_count integer;article_count integer;
begin
 if auth.uid() is null or auth.uid() is distinct from expected_owner then raise exception 'Account changed. Sign in again';end if;
 delete from public.english_imported_questions where user_id=auth.uid() and batch_id=import_batch;get diagnostics question_count=row_count;
 delete from public.english_reading_articles where user_id=auth.uid() and import_batch_id=import_batch;get diagnostics article_count=row_count;
 return jsonb_build_object('questions',question_count,'articles',article_count);
end $$;
revoke all on function public.commit_english_import(jsonb,uuid,text,uuid), public.undo_english_import(uuid,uuid) from public,anon;
grant execute on function public.commit_english_import(jsonb,uuid,text,uuid), public.undo_english_import(uuid,uuid) to authenticated;
