-- 008: one rating per logged-in student per unit, and the admin's rating summary. Run once, after 001-007.
create unique index if not exists ratings_one_per_user on public.ratings (unit_path, user_id) where user_id is not null;

create or replace function public.admin_rating_summary(p_limit int default 100)
returns table (unit_path text, avg_stars numeric, votes bigint, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.unit_path, round(avg(r.stars), 2), count(*), max(r.created_at)
  from ratings r
  where public.is_admin()
  group by r.unit_path
  order by max(r.created_at) desc
  limit least(p_limit, 500);
$$;
revoke execute on function public.admin_rating_summary(int) from public, anon;
grant execute on function public.admin_rating_summary(int) to authenticated;
