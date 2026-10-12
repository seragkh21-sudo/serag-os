create or replace function public.engoplay_keep_best_attempt()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.user_id := old.user_id;
  new.activity_date := old.activity_date;
  new.question_key := old.question_key;
  new.daily_goal := old.daily_goal;
  new.learned_at := old.learned_at;
  new.correct := old.correct or new.correct;
  if old.correct then new.selected_answer := old.selected_answer; end if;
  return new;
end;
$$;
revoke all on function public.engoplay_keep_best_attempt() from public, anon, authenticated;
create trigger engoplay_keep_best_attempt before update on public.engoplay_activity
for each row execute function public.engoplay_keep_best_attempt();
