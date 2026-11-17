-- EXAMPLE ONLY. Replace with your real subjects. Run AFTER 007.
-- 1) subjects: slug = folder name inside /programs/
insert into public.subjects (slug, name, sort_order) values
  ('python', 'Python', 1), ('java', 'Java', 2), ('html', 'HTML', 3)
on conflict (slug) do nothing;

-- 2) courses: one row per subject AND language. path = where the course starts. total_units = number of units (for progress %).
--    English units: /programs/python/unit_1.html ...   Hindi units: /programs/python/unit_1_hindi.html ...
insert into public.courses (subject_id, language, slug, name, path, total_units)
select s.id, v.language, v.slug, s.name, v.path, v.units
from (values
  ('python', 'en', 'python-en', '/programs/python/',             10),
  ('python', 'hi', 'python-hi', '/programs/python/index_hindi.html', 10),
  ('java',   'en', 'java-en',   '/programs/java/',               14),
  ('html',   'en', 'html-en',   '/programs/html/',                8)
) as v(subject, language, slug, path, units)
join public.subjects s on s.slug = v.subject
on conflict (slug) do nothing;

-- 3) placements: which branch + semester uses which subject. (A subject with NO placement is an Individual Course:
--    it only appears under "+ Add course".) The same subject can be placed in many branches.
insert into public.course_placements (branch, semester, subject_id, sort_order)
select v.branch, v.semester, s.id, v.ord
from (values
  ('pgdca', 2, 'python', 1),
  ('pgdca', 3, 'java',   1),
  ('dsml',  1, 'python', 1)
) as v(branch, semester, subject, ord)
join public.subjects s on s.slug = v.subject
on conflict do nothing;
