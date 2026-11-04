-- Run this ONLY if you already ran 001-004 earlier (fixes programs that have no semester).
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
