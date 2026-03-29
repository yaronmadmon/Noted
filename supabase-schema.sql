-- Run this in your Supabase SQL Editor
-- Safe to re-run — uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS throughout

-- profiles: ensure table exists, then ensure all columns exist
create table if not exists profiles (
  id uuid primary key,
  created_at timestamptz default now()
);

alter table profiles add column if not exists email text not null default '';
alter table profiles add column if not exists compilations_used integer not null default 0;
alter table profiles add column if not exists compilations_limit integer not null default 15;
alter table profiles add column if not exists plan text not null default 'free';

-- source_files
create table if not exists source_files (
  id uuid primary key,
  created_at timestamptz default now()
);

alter table source_files add column if not exists compilation_id uuid;
alter table source_files add column if not exists file_name text not null default '';
alter table source_files add column if not exists file_type text not null default '';
alter table source_files add column if not exists storage_path text not null default '';
alter table source_files add column if not exists extracted_text text not null default '';

-- compilations
create table if not exists compilations (
  id uuid primary key,
  created_at timestamptz default now()
);

alter table compilations add column if not exists user_id uuid;
alter table compilations add column if not exists intent text not null default '';
alter table compilations add column if not exists status text not null default 'pending';
alter table compilations add column if not exists output jsonb;

-- Storage bucket: create via Supabase dashboard → Storage → New bucket → name: uploads, private
