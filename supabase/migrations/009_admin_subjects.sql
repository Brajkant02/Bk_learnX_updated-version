-- 009: lets the ADMIN add and change subjects, courses and placements from  Admin > Subjects.
-- Students and visitors can still only READ them. Run once, after 001-008.

grant insert, update, delete on public.subjects, public.courses, public.course_placements to authenticated;

drop policy if exists "admin writes subjects" on public.subjects;
create policy "admin writes subjects" on public.subjects for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin writes courses" on public.courses;
create policy "admin writes courses" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin writes placements" on public.course_placements;
create policy "admin writes placements" on public.course_placements for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- sanity rules for NEW rows (old rows are not re-checked)
alter table public.subjects drop constraint if exists subjects_slug_format;
alter table public.subjects add constraint subjects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60) not valid;
alter table public.subjects drop constraint if exists subjects_name_len;
alter table public.subjects add constraint subjects_name_len check (char_length(name) between 1 and 100) not valid;
alter table public.courses drop constraint if exists courses_slug_format;
alter table public.courses add constraint courses_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 70) not valid;
alter table public.courses drop constraint if exists courses_path_format;
alter table public.courses add constraint courses_path_format check (path like '/%' and char_length(path) <= 300) not valid;
alter table public.courses drop constraint if exists courses_units_range;
alter table public.courses add constraint courses_units_range check (total_units between 0 and 500) not valid;
alter table public.course_placements drop constraint if exists placements_semester_range;
alter table public.course_placements add constraint placements_semester_range check (semester is null or semester between 1 and 12) not valid;
alter table public.course_placements drop constraint if exists placements_branch_format;
alter table public.course_placements add constraint placements_branch_format check (branch ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
