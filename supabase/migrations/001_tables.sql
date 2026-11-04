-- BK LearnX: tables. Run 001 -> 004 in order in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  mobile text,
  program text,
  semester int,
  avatar_url text,
  role text not null default 'student' check (role in ('student','admin')),
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  program text not null,
  semester int,
  name text not null,
  slug text not null unique,
  path text not null,
  total_units int not null default 0,
  sort_order int not null default 0
);

create table public.user_courses (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  unit_path text not null,
  completed boolean not null default false,
  last_visited_at timestamptz not null default now(),
  primary key (user_id, unit_path)
);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit_path text not null,
  title text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, unit_path)
);

create table public.typing_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wpm numeric not null check (wpm between 0 and 400),
  accuracy numeric not null check (accuracy between 0 and 100),
  mistakes int not null check (mistakes >= 0),
  exam_type text,
  created_at timestamptz not null default now()
);
create index on public.typing_results (user_id, created_at);

create table public.typing_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  wpm numeric check (wpm between 0 and 400),
  accuracy numeric check (accuracy between 0 and 100),
  mistakes int check (mistakes >= 0),
  exam_type text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null default '',
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  unit_path text not null check (char_length(unit_path) between 1 and 300),
  user_id uuid references public.profiles(id) on delete set null,
  stars int not null check (stars between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);
create index on public.ratings (unit_path);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 1 and 2000),
  status text not null default 'new' check (status in ('new','read','done')),
  created_at timestamptz not null default now()
);
