-- 007: every SUBJECT lives once, in /programs/<slug>/ .
--   subjects          = the subject itself (java, python, html ...)
--   courses           = one row per subject + language   (java-en, java-hi)
--   course_placements = which branch + semester uses which subject (decided here, in the database)
--   profiles.medium   = the student's medium of study ('en' or 'hi')
-- Run once, after 001-006.

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- same as the folder name in /programs/
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.course_placements (
  id uuid primary key default gen_random_uuid(),
  branch text not null,               -- slug from programs.js (pgdca, dsml, ...)
  semester int,                       -- null if the branch has no semesters
  subject_id uuid not null references public.subjects(id) on delete cascade,
  sort_order int not null default 0
);
create unique index if not exists course_placements_uniq on public.course_placements (branch, coalesce(semester, 0), subject_id);

alter table public.courses add column if not exists subject_id uuid references public.subjects(id) on delete cascade;
alter table public.courses add column if not exists language text not null default 'en';
alter table public.courses drop constraint if exists courses_language_check;
alter table public.courses add constraint courses_language_check check (language in ('en','hi'));
alter table public.courses alter column program drop not null;   -- old columns stay but are no longer used
create unique index if not exists courses_subject_language on public.courses (subject_id, language) where subject_id is not null;

alter table public.profiles add column if not exists medium text not null default 'en';
alter table public.profiles drop constraint if exists profiles_medium_check;
alter table public.profiles add constraint profiles_medium_check check (medium in ('en','hi'));

-- security
alter table public.subjects enable row level security;
alter table public.course_placements enable row level security;
grant select on public.subjects, public.course_placements to anon, authenticated;
drop policy if exists "subjects public" on public.subjects;
create policy "subjects public" on public.subjects for select to anon, authenticated using (true);
drop policy if exists "placements public" on public.course_placements;
create policy "placements public" on public.course_placements for select to anon, authenticated using (true);
grant update (medium) on public.profiles to authenticated;

-- new sign-ups also save the medium
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, mobile, program, semester, avatar_url, medium)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'program',
    nullif(new.raw_user_meta_data->>'semester', '')::int,
    new.raw_user_meta_data->>'avatar_url',
    case when new.raw_user_meta_data->>'medium' = 'hi' then 'hi' else 'en' end
  );
  return new;
end $$;

-- My Courses = subjects placed in my branch + semester (in MY medium, English if Hindi is missing) + courses I added
drop function if exists public.my_courses();
create function public.my_courses()
returns table (id uuid, subject_id uuid, name text, slug text, path text, language text, source text,
               fallback boolean, total_units int, completed_units int, percent int)
language sql stable set search_path = public as $$
  with me as (select program, semester, medium from profiles where id = auth.uid()),
  auto as (
    select distinct on (c.subject_id) c.id, c.subject_id, c.name, c.slug, c.path, c.language,
           'semester'::text as source, (c.language <> me.medium) as fallback, c.total_units, cp.sort_order as ord
    from me
    join course_placements cp on cp.branch = me.program and cp.semester is not distinct from me.semester
    join courses c on c.subject_id = cp.subject_id
    order by c.subject_id, (c.language = me.medium) desc, (c.language = 'en') desc
  ),
  added as (
    select c.id, c.subject_id, c.name, c.slug, c.path, c.language,
           'added'::text as source, false as fallback, c.total_units, 1000 as ord
    from user_courses uc join courses c on c.id = uc.course_id where uc.user_id = auth.uid()
  ),
  mine as (
    select distinct on (u.id) u.* from (select * from auto union all select * from added) u
    order by u.id, u.source desc
  ),
  done as (
    select course_id, count(*) filter (where completed) as n from progress where user_id = auth.uid() group by course_id
  )
  select m.id, m.subject_id, m.name, m.slug, m.path, m.language, m.source, m.fallback, m.total_units,
         coalesce(d.n, 0)::int,
         case when m.total_units > 0 then round(100.0 * coalesce(d.n, 0) / m.total_units)::int else 0 end
  from mine m left join done d on d.course_id = m.id
  order by m.ord, m.name;
$$;
revoke execute on function public.my_courses() from public, anon;
grant execute on function public.my_courses() to authenticated;
