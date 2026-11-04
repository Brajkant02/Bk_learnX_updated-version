-- Row Level Security + minimal grants. Students see only their own data.

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.user_courses enable row level security;
alter table public.progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.typing_results enable row level security;
alter table public.typing_leads enable row level security;
alter table public.messages enable row level security;
alter table public.announcements enable row level security;
alter table public.ratings enable row level security;
alter table public.contact_messages enable row level security;

-- Start from zero, then grant only what is needed
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.courses, public.announcements to anon, authenticated;
grant insert on public.typing_leads, public.contact_messages, public.ratings to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, mobile, program, semester, avatar_url) on public.profiles to authenticated;  -- NOT role / blocked
grant select, insert, update, delete on public.user_courses, public.progress, public.bookmarks to authenticated;
grant select, insert on public.typing_results to authenticated;
grant select on public.messages to authenticated;
grant update (is_read) on public.messages to authenticated;
grant insert on public.messages to authenticated;                       -- admin only via policy
grant insert, update, delete on public.announcements to authenticated;   -- admin only via policy
grant select, delete on public.typing_leads to authenticated;           -- admin only via policy
grant select, delete on public.ratings to authenticated;                -- admin only via policy
grant select, delete on public.contact_messages to authenticated;       -- admin only via policy
grant update (status) on public.contact_messages to authenticated;

-- profiles
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- courses: public catalog
create policy "courses public" on public.courses for select to anon, authenticated using (true);

-- student-owned data (blocked students cannot write)
create policy "own user_courses" on public.user_courses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and not public.is_blocked());
create policy "own progress" on public.progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and not public.is_blocked());
create policy "own bookmarks" on public.bookmarks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and not public.is_blocked());
create policy "own typing read" on public.typing_results for select to authenticated using (user_id = auth.uid());
create policy "own typing insert" on public.typing_results for insert to authenticated
  with check (user_id = auth.uid() and not public.is_blocked());

-- inbox
create policy "own messages read" on public.messages for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "own messages mark read" on public.messages for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin sends messages" on public.messages for insert to authenticated
  with check (public.is_admin());

-- announcements
create policy "active announcements" on public.announcements for select to anon, authenticated
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy "admin announcements read" on public.announcements for select to authenticated using (public.is_admin());
create policy "admin announcements write" on public.announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- guests and students may submit; only admin may read/delete
create policy "anyone submits lead" on public.typing_leads for insert to anon, authenticated with check (true);
create policy "admin reads leads" on public.typing_leads for select to authenticated using (public.is_admin());
create policy "admin deletes leads" on public.typing_leads for delete to authenticated using (public.is_admin());

create policy "anyone submits rating" on public.ratings for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "admin reads ratings" on public.ratings for select to authenticated using (public.is_admin());
create policy "admin deletes ratings" on public.ratings for delete to authenticated using (public.is_admin());

create policy "anyone submits contact" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin reads contact" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "admin updates contact" on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes contact" on public.contact_messages for delete to authenticated using (public.is_admin());

-- function permissions
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_admin(), public.is_blocked() to anon, authenticated;
grant execute on function public.unit_rating(text) to anon, authenticated;
grant execute on function public.my_courses(), public.typing_daily(int), public.delete_my_account(),
  public.admin_list_students(text, int, int), public.admin_set_blocked(uuid, boolean),
  public.admin_delete_student(uuid), public.admin_stats(), public.admin_unit_reads(int) to authenticated;
