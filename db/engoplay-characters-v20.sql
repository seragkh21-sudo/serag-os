-- Applied via engoplay_illustrated_characters. Legacy IDs remain readable for existing accounts.
alter table public.profiles drop constraint profiles_avatar_choice;
alter table public.profiles add constraint profiles_avatar_choice check (avatar_id in ('chick','cat','panda','fox','bunny','bear','curly','beard','cozy','spectacles','cheer','poised','thinker','dreamer','wise'));
alter table public.profiles alter column avatar_id set default 'curly';
