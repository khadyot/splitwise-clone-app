# Currency Localization — Splitwise

## The rule

No currency symbol is ever hardcoded in a component, a string template, or a utility default. This app is used across different countries and groups, unlike Expense Tracker (which is fixed to ₹). Every group carries its own currency, and every amount displayed anywhere reads from that group's setting.

## Implementation

- `groups.currency` stores an ISO 4217 code (`INR`, `USD`, `EUR`, `GBP`, etc.), set at group creation.
- Default the currency picker to a sensible guess from the browser's locale (`Intl.NumberFormat().resolvedOptions()` or similar), but always let the creator override it via a dropdown, don't silently lock it.
- `formatCurrency(amount: number, currencyCode: string)` in `lib/utils.ts` takes the code as a required parameter, no default fallback to USD or INR. Every call site must pass the group's actual currency.
- All expenses and settlements within a group inherit that group's currency. There is no per-expense currency override and no live exchange-rate conversion between groups, both are explicitly out of scope for v1, per AGENTS.md.
- The currency should be visible near the group name or in group settings, so participants aren't guessing what currency amounts are in.

## What NOT to build

Do not add a currency conversion API, live FX rates, or multi-currency expenses within a single group. If a task seems to require any of these, stop and flag it rather than building a workaround.
