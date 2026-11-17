-- Lets "Continue where you left off" show the unit title. Run once.
alter table public.progress add column if not exists unit_title text;
