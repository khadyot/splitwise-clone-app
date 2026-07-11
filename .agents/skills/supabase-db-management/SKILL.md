# Supabase DB Management — Splitwise

## Why Supabase, not local filesystem JSON

The current `data.json` + `fs.writeFileSync` approach cannot work once deployed. Vercel serverless functions do not guarantee a writable, persistent filesystem between invocations, and this app is inherently multiplayer (several people on several devices need to see the same group state). Supabase Postgres replaces `lib/storage.ts` entirely.

## Locked schema

```sql
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
```

## Conventions

- `expense_splits` is always populated at write time, regardless of `split_type`. Even an EQUAL split resolves to explicit per-participant amounts at insert time. `calculateBalances()` should only ever read `expense_splits`, never re-derive equal splits at query time. This avoids the schema-mismatch bug the audit flagged in the old `Expense.paidBy` field.
- `paid_by` is a single participant per expense for v1. Multi-payer expenses are explicitly out of scope, per AGENTS.md.
- Balance calculation = sum of what each participant paid, minus sum of their `expense_splits` shares, minus/plus any `settlements` involving them. Settling up inserts a row into `settlements`, it never touches `expenses` or `expense_splits`.
- Migrations live in `supabase/migrations/` as timestamped `.sql` files, applied via the Supabase CLI or dashboard SQL editor. Do not hand-edit tables outside of migration files.
- The Supabase client is server-only, initialized once in `lib/supabase.ts` using the service role key from environment variables. There is no client-side Supabase usage and no Row Level Security policy is needed as a result, since all access is gated through Server Actions.
- Join codes: generate a 6-character uppercase alphanumeric code (excluding ambiguous characters like `0`, `O`, `1`, `I`), check for collision against existing `groups.join_code`, regenerate on collision.
