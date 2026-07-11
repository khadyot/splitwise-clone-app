# Supabase Persistence Migration Report

This report documents the first phase of our Splitwise project migration: replacing the local filesystem JSON storage (`data.json`) with a Supabase PostgreSQL database while consolidating the workspace structure. Every decision aligns strictly with `.agents/AGENTS.md` and `.agents/skills/supabase-db-management/SKILL.md`.

---

## 1. Schema & Client Setup

### `[NEW]` [supabase/migrations/0001_init.sql](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/supabase/migrations/0001_init.sql)
Created the exact locked schema from `supabase-db-management/SKILL.md`. No additional tables or columns were introduced.
- **`groups`**: Stores group metadata, unique 6-character uppercase alphanumeric `join_code` (collision-checked on insert), and defaults to `'INR'` currency (`ISO 4217`).
- **`participants`**: Replaces the old "users" concept within groups. Stores `name`, `group_id` (cascading on delete), and device-local `session_token` UUIDs. No auth or accounts are required.
- **`expenses`**: Stores expense details, linking to `groups(id)` and `participants(id)` (`paid_by`), with `split_type` checked against `('EQUAL', 'EXACT', 'PERCENTAGE')`.
- **`expense_splits`**: Explicit per-participant share records (`amount`). Populated at write time for all split types, including `EQUAL`.
- **`settlements`**: Non-destructive ledger table recording payments between participants (`from_participant` to `to_participant`) with `method` defaulting to `'other'`.

### `[NEW]` [lib/supabase.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/supabase.ts)
Created a single server-side Supabase client (`createClient`) using environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Configured `persistSession: false` and `autoRefreshToken: false` since all access is gated server-side through Next.js Server Actions.

### `[NEW]` [.env.local.example](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/.env.local.example)
Documented the two required Supabase environment variables:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

## 2. Storage Layer Replacement

### `[MODIFY]` [lib/storage.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/storage.ts)
Replaced all synchronous `fs.readFileSync` and `fs.writeFileSync` operations targeting `data.json` with asynchronous Supabase database queries.
- **Signatures & Interfaces Maintained**: Preserved `User`, `Group`, `Expense`, `Split`, `Payer`, and `Data` interfaces so existing server actions (`createGroup`, `addMember`, `createExpense`, `settleUp`) continue functioning without needing a full logic rewrite in this phase.
- **UUID Generation**: Updated `generateId()` to return `crypto.randomUUID()` so generated IDs conform to PostgreSQL UUID primary keys.
- **`readData(): Promise<Data>`**: Queries `groups`, `participants`, `expenses`, and `expense_splits` from Supabase and transforms them into the legacy `Data` object shape (`{ users, groups, expenses }`).
- **`writeData(data: Data): Promise<void>`**:
  - Automatically checks or generates unique 6-character uppercase `join_code`s when inserting new `groups`.
  - Syncs `participants` and guarantees foreign key safety by ensuring all referenced participant IDs (`paid_by`, member IDs, and split participants) exist in `participants` before inserting `expenses` or `expense_splits`.
  - Populates `expense_splits` rows explicitly on expense insert (`EXACT`, `PERCENTAGE`, and `EQUAL`), adhering to the rule that equal splits must be resolved and written at insert time.
  - **Non-Destructive Guarantee**: `writeData` only performs additive `insert`/`upsert` operations. It never deletes rows from Supabase (`expenses` or `expense_splits`), ensuring `settleUp()` calls cannot accidentally purge ledger records.

---

## 3. Workspace Consolidation & Cleanup

- **Removed Scaffolding & Old Folders**: Deleted the empty root-level scaffolding (`app/`, `components/`, and `lib/` at the old workspace root) and the `splitwise-web/` folder.
- **Deleted `data.json`**: Removed the local filesystem database file.
- **Promoted `splitwise-v2/` to Project Root**: Moved all files and folders (`app/`, `components/`, `lib/`, `public/`, `package.json`, etc.) from `splitwise-v2/` up to the main workspace root (`/Users/khadyot/Desktop/Ongoing/Projects_AI IDE/Splitwise`). This eliminates folder ambiguity.

---

## 4. Call Site Updates & Configuration Fixes

### `[MODIFY]` [app/actions.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/actions.ts), [app/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/page.tsx), [app/groups/[id]/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/groups/%5Bid%5D/page.tsx), [components/Sidebar.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/components/Sidebar.tsx)
- Added `await` when calling `readData()` and `writeData(data)` to accommodate Supabase asynchronous responses.

### `[MODIFY]` [tsconfig.json](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/tsconfig.json)
- Updated `"moduleResolution": "bundler"` (from `"node"`), resolving TypeScript compilation errors when importing type declarations from `tailwindcss` v4 inside Next.js 16 (`tailwind.config.ts`).

---

## 5. Build Verification (`npm run build`)

Verified that the application compiles cleanly from the new workspace root using `npm run build`:

```bash
> splitwise-clone@0.1.0 build
> next build

▲ Next.js 16.1.4 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 6.6s
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/3) ...
✓ Generating static pages using 7 workers (3/3) in 15.9s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /groups/[id]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## Next Steps (Governed by `AGENTS.md`)
1. Refactor server actions (`app/actions.ts`) to query and insert into Supabase directly (`createExpense` passing correct `Payer[]` / explicit `expense_splits`, `settleUp` inserting `settlements` records rather than deleting expenses).
2. Implement exact currency formatting (`₹` / `INR`) across all UI and logic components per `skills/currency-localization/SKILL.md`.
3. Implement guest identity checks (`skills/guest-identity-guard/SKILL.md`) for session-token verification.
