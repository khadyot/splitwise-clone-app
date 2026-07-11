# Currency Localization Report

This report documents Phase 4: full removal of hardcoded currency symbols and implementation of locale-aware formatting across the codebase, per `.agents/AGENTS.md` ("Currency is dynamic, never hardcoded") and `.agents/skills/currency-localization/SKILL.md`.

---

## 1. File-by-File Summary of Changes

### `[MODIFY]` [lib/utils.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/utils.ts)
- **Rewrote `formatCurrency()`** — Now requires `(amount: number, currencyCode: string)`, no default fallback. Uses a `CURRENCY_LOCALES` map to resolve the appropriate locale per ISO 4217 code (`INR → en-IN`, `USD → en-US`, `GBP → en-GB`, `EUR → de-DE`, etc.) and passes both to `Intl.NumberFormat`.
- **Added `getCurrencySymbol()`** — Utility to extract just the symbol for a given currency code using `Intl.NumberFormat` (available to any future UI component needing just the symbol).
- **No default USD fallback** — Any call site that fails to pass `currencyCode` is now a TypeScript type error.

### `[MODIFY]` [lib/storage.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/lib/storage.ts)
- **`Group` interface**: Added `currency: string` field (ISO 4217 code).
- **`readData()`**: Maps `g.currency || 'INR'` from the raw Supabase row into every `Group` object.
- **`writeData()`**: Updated group insert to use `(g as any).currency || 'INR'` instead of the previously hardcoded `'INR'` literal.

### `[MODIFY]` [app/actions.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/actions.ts)
- **`createGroup()`** rewired: Reads `currency` from `FormData`, validates against the supported list (`INR, USD, EUR, GBP, AUD, CAD, SGD, JPY, CNY, AED`), and inserts it directly into Supabase (`supabase.from('groups').insert({ ..., currency: safeCurrency })`). The previous path through `writeData()` is now bypassed for group creation (it had the currency hardcoded to `'INR'`).
- **Inline join-code generation**: The group creation action now generates its own collision-safe join code inline (matching the `SKILL.md` convention), removing the dependency on `writeData`'s internal join code generation.

### `[NEW]` [components/CreateGroupForm.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/components/CreateGroupForm.tsx)
- **Client component** with a group name input and a currency `<select>` dropdown covering: `INR, USD, EUR, GBP, AUD, CAD, SGD, JPY, AED`.
- **Browser-locale guess**: On mount (`useEffect`), reads `navigator.language`, extracts the region segment, maps it to a currency code via a `regionMap` (`IN→INR`, `US→USD`, `GB→GBP`, etc.), and pre-selects that currency. User can always override via the dropdown.
- **Never silently locked**: Dropdown is always visible and editable.

### `[MODIFY]` [app/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/page.tsx)
- **Removed hardcoded `$0.00`** "Total Balance" placeholder section (was `<p>$0.00</p>` for "you owe" and "you are owed") — removed entirely since there's no real identity context on the dashboard yet (separate scope).
- **Replaced dead "Create a group" button** with inline `<CreateGroupForm />` component (name + currency picker).
- **Currency badge on group cards**: Each group in the "Your Groups" list now shows its `group.currency` code as a small `bg-gray-100` badge (e.g., `INR`, `USD`).

### `[MODIFY]` [app/groups/[id]/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/app/groups/%5Bid%5D/page.tsx)
- **Currency badge in header**: Added `• INR` (or whichever code) as a `bg-gray-200` pill badge next to "X members • Created date" in the group header — always visible so participants know what currency the numbers are in.
- **All `formatCurrency()` calls updated** to pass `group.currency`:
  - Expense list: `"${getUserName(expense.paidBy)} paid ${formatCurrency(expense.amount, group.currency)}"`
  - "You borrowed" amount: `formatCurrency(expense.amount / group.members.length, group.currency)`
  - Balance list: `formatCurrency(Math.abs(b.amount), group.currency)`
- **`calculateBalances()` now passes settlements**: `calculateBalances(group, groupExpenses, data.users, groupSettlements)` — this was missing from the group page since Phase 3.
- **`currency` passed to `<AddExpenseForm>`** and **`<SettleUpUI>`**.

### `[MODIFY]` [components/AddExpenseForm.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/components/AddExpenseForm.tsx)
- Added `currency: string` to `AddExpenseFormProps`.
- Updated Amount label from hardcoded `"Amount ($)"` to `"Amount ({currency})"` — shows `"Amount (INR)"`, `"Amount (USD)"`, etc.
- Removed hardcoded `placeholder="$0.00"` from the EXACT split inputs — now plain `"0.00"`.

### `[MODIFY]` [components/SettleUpUI.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/components/SettleUpUI.tsx)
- Added `currency: string` to `SettleUpUIProps`.
- Updated `formatCurrency(debt.amount)` → `formatCurrency(debt.amount, currency)` in the debt list.
- Updated `"Amount ($)"` label in the settlement form to `"Amount ({currency})"`.

---

## 2. Manual Format Test — Verified Output

Ran `npx tsx test_currency.ts` directly against the updated `lib/utils.ts`:

```
=== INR Group ===
₹30.00
₹1,000.00
₹10,50,000.00      ← Indian lakh-crore grouping, correct

=== USD Group ===
$30.00
$1,000.00

=== EUR Group ===
30,00 €            ← German locale: comma decimal, dot thousands, symbol after
1.000,00 €

=== GBP Group ===
£30.00

=== Independent Per-Group Formatting ===

India Trip (INR):   ₹5,000.00  ₹250.00  ₹1,200.00
NYC Trip (USD):     $45.99     $120.00  $8.50
London Trip (GBP):  £22.50     £85.00   £12.00
```

Each group formats completely independently using its own currency code and locale — no cross-contamination.

---

## 3. Hardcoded Symbol Audit (Zero Remaining)

Searched for all remaining `$`, `₹`, and currency string occurrences in `.tsx`/`.ts` source files:

| Location | Before | After |
|---|---|---|
| `lib/utils.ts` | `currency: 'USD'`, `'en-US'` hardcoded | ✅ Dynamic via `currencyCode` param |
| `app/page.tsx` | `$0.00` × 2 in JSX | ✅ Removed (placeholder section removed) |
| `components/AddExpenseForm.tsx` | `"Amount ($)"`, `placeholder="$0.00"` | ✅ `Amount ({currency})`, `placeholder="0.00"` |
| `components/SettleUpUI.tsx` | `formatCurrency(debt.amount)`, `"Amount ($)"` | ✅ Currency-parameterized |
| `app/groups/[id]/page.tsx` | `formatCurrency(amount)` × 3 | ✅ All pass `group.currency` |

**Zero hardcoded `$` or `₹` symbols remain in any component, string template, or utility default.**

---

## 4. Build Verification (`npm run build`)

```bash
> splitwise-clone@0.1.0 build
> next build

▲ Next.js 16.1.4 (Turbopack)
✓ Compiled successfully in 13.6s
  Running TypeScript ...
✓ Generating static pages using 7 workers (3/3) in 16.9s

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /groups/[id]
```

Build passes cleanly with zero TypeScript errors.
