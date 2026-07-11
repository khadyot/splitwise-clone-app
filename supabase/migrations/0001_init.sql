create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique, -- 6-character uppercase alphanumeric, collision-checked on insert
  currency text not null default 'INR', -- ISO 4217 code
  created_at timestamptz not null default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  session_token uuid not null default gen_random_uuid(), -- issued to the device on join, stored client-side
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  paid_by uuid not null references participants(id),
  category text not null default 'general',
  split_type text not null check (split_type in ('EQUAL', 'EXACT', 'PERCENTAGE')),
  created_at timestamptz not null default now()
);

create table expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  participant_id uuid not null references participants(id),
  amount numeric(12,2) not null -- this participant's share, always a resolved amount regardless of split_type
);

create table settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_participant uuid not null references participants(id),
  to_participant uuid not null references participants(id),
  amount numeric(12,2) not null,
  method text not null default 'other', -- 'cash' | 'transfer' | 'other'
  created_at timestamptz not null default now()
);
