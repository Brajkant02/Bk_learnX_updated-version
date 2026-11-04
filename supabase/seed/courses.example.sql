-- EXAMPLE ONLY. Replace with your real programs/subjects, then run it.
-- path = the page of that subject on your site. total_units = number of units (used for progress %).
insert into public.courses (program, semester, name, slug, path, total_units, sort_order) values
  ('pgdca', 1, 'Computer Fundamentals', 'pgdca-s1-computer-fundamentals', '/pages/programs/pgdca/semester-1/computer-fundamentals/', 5, 1),
  ('pgdca', 1, 'Python (Hindi)',         'pgdca-s1-python',               '/pages/programs/pgdca/semester-1/python/',                10, 2),
  ('java',  null, 'Java',                'java',                           '/pages/programs/java/',                                   14, 1)
on conflict (slug) do nothing;
