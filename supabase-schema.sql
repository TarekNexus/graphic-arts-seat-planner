-- ============================================================
-- Graphic Arts Institute Seat Planner — Supabase Schema
-- Run this once in your Supabase project → SQL Editor
-- ============================================================

create table if not exists departments (
  id         uuid        primary key,
  name       text        not null,
  short_code text        not null,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id         uuid        primary key,
  number     text        not null,
  rows       integer     not null,
  columns    integer     not null,
  capacity   integer     not null,
  created_at timestamptz not null default now()
);

create table if not exists seat_plans (
  id               uuid        primary key,
  title            text        not null,
  institute_name   text        not null default '',
  exam_date        text        not null default '',
  exam_time        text,
  exam_shift       text,
  pattern          text        not null default 'C',
  seat_groups      jsonb       not null default '[]',
  room_allocations jsonb       not null default '[]',
  created_at       timestamptz not null default now()
);

-- If the table already exists, add the new columns:
alter table seat_plans add column if not exists exam_time  text;
alter table seat_plans add column if not exists exam_shift text;

-- Disable Row Level Security (open access with anon key).
-- For a multi-user production app, enable RLS and add policies.
alter table departments  disable row level security;
alter table rooms        disable row level security;
alter table seat_plans   disable row level security;
