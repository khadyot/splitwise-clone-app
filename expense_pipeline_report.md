# Expense Logic & Data Pipeline Refactoring Report

This report documents Phase 2 of our project building process: refactoring `createExpense`, serializing dynamic split form inputs (`EQUAL`, `EXACT`, `PERCENTAGE`), and updating our balance calculation logic (`calculateBalances`) to read exclusively from the `expense_splits` database table. Every change strictly follows `.agents/AGENTS.md` and `.agents/skills/supabase-db-management/SKILL.md`.

---

## 1. File-by-File Summary of Changes

### `[MODIFY]` [app/actions.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/actions.ts)
- **Direct Supabase Database Insertion**: Replaced the legacy file-like `readData()`/`writeData()` push pattern inside `createExpense()` with atomic server-side insertions directly into Supabase (`expenses` and `expense_splits` tables).
- **Single Payer Standard (`paid_by`)**: Reads `paidBy` from `FormData` as the single participant ID who paid the expense, strictly conforming to our v1 single-payer scope rule (`AGENTS.md`).
- **Dynamic Split Type Resolution (`split_type` & `expense_splits`)**:
  - Reads `splitType` (`'EQUAL' | 'EXACT' | 'PERCENTAGE'`) from `FormData` and resolves explicit `expense_splits` rows inside the same server action execution.
  - **`EQUAL`**: Resolves the expense amount evenly across all group participants (`Math.floor((amount * 100) / count) / 100`) and assigns any penny/cent remainder to the last participant (`remaining.toFixed(2)`), guaranteeing `sum(expense_splits.amount) === expense.amount` exactly without penny leaks.
  - **`EXACT`**: Reads per-participant amounts (`split_${pid}` or `splitsJson`) submitted from the form and inserts them directly into `expense_splits`.
  - **`PERCENTAGE`**: Reads submitted per-participant percentages, resolves each against the total `amount` (`((amount * pct) / 100).toFixed(2)`), and inserts those calculated currency amounts into `expense_splits`.

### `[MODIFY]` [components/AddExpenseForm.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/components/AddExpenseForm.tsx)
- **Serialized Split Values**: Added hidden form inputs (`<input type="hidden" name="splitType" />`, `<input type="hidden" name="splitsJson" />`, and `<input type="hidden" name="membersJson" />`) so whenever a user selects `EXACT` or `PERCENTAGE` and adjusts individual values (`splits[memberId]`), those exact numbers leave the client component and are received cleanly by `createExpense`.
- **Automatic Form Reset**: Wrapped the `action` in an async handler (`handleSubmit`) that resets `amount`, `splitType` back to `"EQUAL"`, and `splits` back to `{}` upon submission completion so the UI is ready for the next expense entry without requiring a page refresh.

### `[MODIFY]` [lib/logic.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/logic.ts)
- **Single Source of Truth (`expense_splits`)**: Refactored `calculateBalances()` so that instead of re-deriving equal shares or percentages at query/calculation time from legacy fields, it reads exclusively from `expense.splits` (which maps 1-to-1 to rows in the `expense_splits` table).
- **Retired Legacy Multi-Payer Loop**: Replaced `expense.paidBy.forEach(...)` with a clean check crediting the single payer (`typeof expense.paidBy === 'string' ? expense.paidBy : ...`).
- **Net Balance Cloning Fix**: Updated the debt simplification loop (`while (i < debtors.length && j < creditors.length)`) to operate on a working clone (`workingBalances`) of the net balances. Previously, the debt reduction algorithm zeroed out `debtor.amount` and `creditor.amount` directly on the returned `balanceList`, causing the Group page to display `$0.00` ("gets back $0.00") for every member even when debts existed.

### `[MODIFY]` [lib/storage.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/storage.ts)
- **Retired Legacy `Payer[]` Interface**: Removed `export interface Payer { userId: string; amount: number; }` entirely per requirement 4.
- **Updated `Expense` Type**: Changed `paidBy: Payer[] | any` to `paidBy: string` (the single participant ID).
- **Simplified `readData()` & `writeData()`**: Updated `readData()` to map `paidBy: e.paid_by` (string UUID directly from Supabase) and simplified `paidById` resolution in `writeData()` to eliminate dead array checks that caused TypeScript narrowing errors (`never.length`).

### `[MODIFY]` [app/groups/[id]/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/groups/%5Bid%5D/page.tsx)
- Updated the expense list rendering from the old `expense.paidBy.length > 1` array check to cleanly display:
  `${getUserName(expense.paidBy)} paid ${formatCurrency(expense.amount)}`.

---

## 2. Manual Test Verification

Walked through a manual verification across 3 participants (**Alice**, **Bob**, **Charlie**) in group `Weekend Trip` (`group_1`) across all three split types:

1. **Expense 1 (`EQUAL`)**: `$30.00` paid by **Alice**.
   - `expense_splits` resolved: Alice `$10.00`, Bob `$10.00`, Charlie `$10.00`.
   - Running net: Alice `+$20.00`, Bob `-$10.00`, Charlie `-$10.00`.
2. **Expense 2 (`EXACT`)**: `$45.00` paid by **Bob**.
   - `expense_splits` submitted: Alice `$15.00`, Bob `$5.00`, Charlie `$25.00`.
   - Running net: Alice `+$5.00` (`20 - 15`), Bob `+$30.00` (`-10 + 40`), Charlie `-$35.00` (`-10 - 25`).
3. **Expense 3 (`PERCENTAGE`)**: `$100.00` paid by **Charlie**.
   - `expense_splits` submitted: Alice `50%` (`$50.00`), Bob `30%` (`$30.00`), Charlie `20%` (`$20.00`).
   - Running net: Alice `-$45.00` (`5 - 50`), Bob `$0.00` (`30 - 30`), Charlie `+$45.00` (`-35 + 80`).

### Verified Output Numbers from `calculateBalances()`:

#### `balances` (Net Balance per Participant):
```json
[
  {
    "userId": "user_charlie",
    "amount": 45
  },
  {
    "userId": "user_bob",
    "amount": 0
  },
  {
    "userId": "user_alice",
    "amount": -45
  }
]
```

#### `debts` (Simplified Settle-Up Instructions):
```json
[
  "Alice owes Charlie $45.00"
]
```
No crashes occurred, exact net balances are preserved (`Charlie: +$45`, `Bob: $0`, `Alice: -$45`), and exact simplified debts (`Alice owes Charlie $45.00`) are derived cleanly from `expense_splits`.

---

## 3. Build Verification (`npm run build`)

Confirmed that `npm run build` compiles cleanly and passes all Next.js and TypeScript validations:

```bash
> splitwise-clone@0.1.0 build
> next build

▲ Next.js 16.1.4 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 6.3s
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/3) ...
✓ Generating static pages using 7 workers (3/3) in 14.7s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /groups/[id]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## Next Upcoming Steps (Separate Passes per `AGENTS.md`)
- **Settle-Up Refactoring**: Updating `settleUp()` in `app/actions.ts` to insert non-destructive `settlements` rows (`supabase-db-management/SKILL.md`) instead of deleting expense history.
- **Dynamic Currency Formatting**: Replacing hardcoded `$` labels with dynamic ISO 4217 group currency symbols (`₹` / `INR`) per `currency-localization/SKILL.md`.
- **Guest Identity Guard**: Verifying device-local `session_token`s when switching user perspectives or adding/settling expenses (`guest-identity-guard/SKILL.md`).
