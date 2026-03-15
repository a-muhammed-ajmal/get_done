-- =============================================
-- GET DONE — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── PROJECTS ─────────────────────────────────
create table if not exists public.projects (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  color         text        not null,
  icon          text        not null default '',
  "order"       integer     not null default 0,
  is_favorite   boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- ── LABELS ───────────────────────────────────
create table if not exists public.labels (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  color         text        not null,
  created_at    timestamptz not null default now()
);

-- ── TASKS ────────────────────────────────────
create table if not exists public.tasks (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  title         text        not null,
  description   text        not null default '',
  completed     boolean     not null default false,
  priority      smallint    not null default 4
                            check (priority in (1, 2, 3, 4)),
  project_id    uuid        references public.projects(id) on delete set null,
  label_ids     uuid[]      not null default '{}',
  due_date      date,
  due_time      time,
  parent_id     uuid        references public.tasks(id) on delete cascade,
  "order"       integer     not null default 0,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz,
  recurring     jsonb,
  quadrant      text        check (quadrant in (
                  'urgent-important',
                  'not-urgent-important',
                  'urgent-not-important',
                  'not-urgent-not-important'
                )),
  gtd_context   text        check (gtd_context in (
                  'inbox', 'next-action', 'waiting-for',
                  'someday-maybe', 'reference', 'project-support'
                )),
  attachments   jsonb       default '[]'::jsonb,
  reminder      jsonb       default null,
  assignee      text        default null
);

-- ── HABITS ───────────────────────────────────
create table if not exists public.habits (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  name          text        not null,
  icon          text        not null default '',
  color         text        not null,
  frequency     text        not null default 'daily'
                            check (frequency in ('daily', 'weekly', 'custom')),
  custom_days   integer[]   not null default '{}',
  target_count  integer     not null default 1,
  completions   jsonb       not null default '{}',
  created_at    timestamptz not null default now(),
  streak        integer     not null default 0,
  best_streak   integer     not null default 0,
  "order"       integer     not null default 0
);

-- ── POMODORO SETTINGS (one row per user) ─────
create table if not exists public.pomodoro_settings (
  user_id                    uuid    primary key references auth.users(id) on delete cascade,
  work_duration              integer not null default 25,
  short_break_duration       integer not null default 5,
  long_break_duration        integer not null default 15,
  sessions_before_long_break integer not null default 4,
  auto_start_break           boolean not null default false,
  auto_start_work            boolean not null default false,
  updated_at                 timestamptz not null default now()
);

-- ── USER PREFERENCES (sync-able UI state) ────
create table if not exists public.user_preferences (
  user_id        uuid    primary key references auth.users(id) on delete cascade,
  show_completed boolean not null default false,
  updated_at     timestamptz not null default now()
);

-- =============================================
-- ROW LEVEL SECURITY — Users see only their data
-- =============================================

alter table public.projects         enable row level security;
alter table public.labels           enable row level security;
alter table public.tasks            enable row level security;
alter table public.habits           enable row level security;
alter table public.pomodoro_settings enable row level security;
alter table public.user_preferences  enable row level security;

-- Projects RLS
drop policy if exists "users_own_projects" on public.projects;
create policy "users_own_projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Labels RLS
drop policy if exists "users_own_labels" on public.labels;
create policy "users_own_labels"
  on public.labels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks RLS
drop policy if exists "users_own_tasks" on public.tasks;
create policy "users_own_tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Habits RLS
drop policy if exists "users_own_habits" on public.habits;
create policy "users_own_habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pomodoro Settings RLS
drop policy if exists "users_own_pomodoro_settings" on public.pomodoro_settings;
create policy "users_own_pomodoro_settings"
  on public.pomodoro_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User Preferences RLS
drop policy if exists "users_own_preferences" on public.user_preferences;
create policy "users_own_preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- INDEXES — Speed up common queries
-- =============================================

create index if not exists idx_tasks_user_id      on public.tasks(user_id);
create index if not exists idx_tasks_project_id   on public.tasks(project_id);
create index if not exists idx_tasks_due_date     on public.tasks(due_date);
create index if not exists idx_tasks_completed    on public.tasks(completed);
create index if not exists idx_projects_user_id   on public.projects(user_id);
create index if not exists idx_labels_user_id     on public.labels(user_id);
create index if not exists idx_habits_user_id     on public.habits(user_id);