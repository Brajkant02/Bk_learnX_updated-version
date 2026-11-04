-- Helpers, triggers, and the functions the frontend calls.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_blocked() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and blocked);
$$;

-- Auto-create a profile for every new sign-up (email or Google)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, mobile, program, semester, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'program',
    nullif(new.raw_user_meta_data->>'semester', '')::int,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- My Courses = my program+semester subjects + courses I added, with progress %
create or replace function public.my_courses()
returns table (id uuid, program text, semester int, name text, slug text, path text,
               source text, total_units int, completed_units int, percent int)
language sql stable set search_path = public as $$
  with me as (select program, semester from profiles where id = auth.uid()),
  mine as (
    select distinct on (c.id) c.id, c.program, c.semester, c.name, c.slug, c.path,
           c.total_units, c.sort_order, x.source
    from (
      select c.id, 'semester'::text as source from courses c, me
        where c.program = me.program and c.semester is not distinct from me.semester
      union all
      select uc.course_id, 'added'::text from user_courses uc where uc.user_id = auth.uid()
    ) x join courses c on c.id = x.id
    order by c.id, x.source desc
  ),
  done as (
    select course_id, count(*) filter (where completed) as n
    from progress where user_id = auth.uid() group by course_id
  )
  select m.id, m.program, m.semester, m.name, m.slug, m.path, m.source, m.total_units,
         coalesce(d.n, 0)::int,
         case when m.total_units > 0 then round(100.0 * coalesce(d.n, 0) / m.total_units)::int else 0 end
  from mine m left join done d on d.course_id = m.id
  order by m.sort_order, m.name;
$$;

-- Typing graph: one row per day = that day's best test + number of tests that day
create or replace function public.typing_daily(p_days int default 30)
returns table (day date, wpm numeric, accuracy numeric, mistakes int, tests int)
language sql stable set search_path = public as $$
  with t as (
    select (created_at at time zone 'Asia/Kolkata')::date as d, r.wpm, r.accuracy, r.mistakes,
      row_number() over (partition by (created_at at time zone 'Asia/Kolkata')::date
                         order by r.wpm desc, r.accuracy desc) as rn,
      count(*) over (partition by (created_at at time zone 'Asia/Kolkata')::date) as cnt
    from typing_results r
    where r.user_id = auth.uid() and r.created_at >= now() - make_interval(days => p_days)
  )
  select d, t.wpm, t.accuracy, t.mistakes, cnt::int from t where rn = 1 order by d;
$$;

-- Average rating of a unit (public)
create or replace function public.unit_rating(p_unit text)
returns table (avg_stars numeric, votes bigint)
language sql stable security definer set search_path = public as $$
  select round(avg(stars), 1), count(*) from ratings where unit_path = p_unit;
$$;

-- Student deletes own account: profile, progress, bookmarks, typing, inbox all cascade
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- Admin functions (every one checks is_admin) ----------
create or replace function public.admin_list_students(p_search text default null, p_limit int default 50, p_offset int default 0)
returns table (id uuid, name text, email text, mobile_masked text, program text, semester int, blocked boolean, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.email,
         case when p.mobile is null or char_length(p.mobile) < 6 then p.mobile
              else left(p.mobile, 2) || repeat('X', char_length(p.mobile) - 4) || right(p.mobile, 2) end,
         p.program, p.semester, p.blocked, p.created_at
  from profiles p
  where public.is_admin() and p.role = 'student'
    and (p_search is null or p.name ilike '%' || p_search || '%' or p.email ilike '%' || p_search || '%')
  order by p.created_at desc
  limit least(p_limit, 200) offset p_offset;
$$;

create or replace function public.admin_set_blocked(p_user uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update profiles set blocked = p_blocked where id = p_user and role = 'student';
end $$;

create or replace function public.admin_delete_student(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if exists (select 1 from profiles where id = p_user and role = 'student') then
    delete from auth.users where id = p_user;
  end if;
end $$;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return json_build_object(
    'total_students', (select count(*) from profiles where role = 'student'),
    'new_7_days', (select count(*) from profiles where role = 'student' and created_at > now() - interval '7 days'),
    'blocked', (select count(*) from profiles where blocked),
    'typing_tests', (select count(*) from typing_results),
    'typing_leads', (select count(*) from typing_leads),
    'avg_rating', (select round(avg(stars), 2) from ratings),
    'new_contact_messages', (select count(*) from contact_messages where status = 'new')
  );
end $$;

create or replace function public.admin_unit_reads(p_limit int default 20)
returns table (unit_path text, readers bigint, completions bigint)
language sql stable security definer set search_path = public as $$
  select pr.unit_path, count(*), count(*) filter (where pr.completed)
  from progress pr
  where public.is_admin()
  group by pr.unit_path order by 2 desc limit least(p_limit, 200);
$$;
