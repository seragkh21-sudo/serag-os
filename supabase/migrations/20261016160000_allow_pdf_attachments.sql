-- Allow private PDF books in the existing attachments table.
-- The bucket remains private and existing user-scoped RLS policies are unchanged.
alter table public.attachments
  drop constraint if exists attachments_kind_check;

alter table public.attachments
  add constraint attachments_kind_check
  check (kind = any (array[
    'file'::text,
    'image'::text,
    'audio'::text,
    'text'::text,
    'link'::text,
    'pdf'::text
  ]));
