# AGENTS.md — Splitwise (working name, rebrand TBD)

These rules govern every task any agent performs on this project. Read this file in full before starting any task, then read every file inside `skills/` that's relevant to that task.

## Project Identity

This is a free, no-account, one-off expense-splitting web app. A person creates a group, gets a short join code, shares it with whoever they're splitting costs with, and everyone joins by entering the code and a name. Nobody signs up. Nobody creates a password. When the trip or dinner is over, people can walk away and never open the app again.

This is NOT a Splitwise clone in ambition. It is a direct answer to Splitwise's most common 2024-2026 user complaints: forced signup for every participant, daily expense caps, and a Pro paywall for basic functionality. Every architecture and product decision should be checked against: "does this add friction for a casual, one-off group?" If yes, cut it or defer it.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript, React 19
- **Styling:** Tailwind CSS v4
- **Persistence:** Supabase (Postgres), accessed only from Server Actions. No client-side Supabase calls, no Supabase Auth.
- **State:** Server Actions + `revalidatePath`, matching the existing pattern. No global client state library needed.
- **Hosting target:** Vercel (web-only, no native mobile build)

## Architecture Principles

1. **No accounts, ever.** No email/password auth, no OAuth, no Supabase Auth, no magic-link email flows. Identity is a `participants` row plus a device-local session token. See `skills/guest-identity-guard/SKILL.md` before touching anything identity-related.
2. **Non-destructive ledger.** Settling up must never delete or mutate expense history. It creates a new settlement record. See `skills/supabase-db-management/SKILL.md`.
3. **Currency is dynamic, never hardcoded.** No `$` or `₹` hardcoded anywhere. Every group has a currency code, every amount is formatted from that code. See `skills/currency-localization/SKILL.md`.
4. **Web-only.** Do not add React Native, Expo, or any mobile-specific code. This is a responsive web app that should work on a phone browser and a laptop browser equally well.

## Naming & Conventions

- Server actions live in `app/actions.ts`, grouped by entity (group actions, expense actions, settlement actions).
- Database access goes through a single `lib/supabase.ts` client, never instantiate the Supabase client inline in a component or action.
- Keep the existing file-based routing structure (`app/`, `app/groups/[id]`).

## Scope Discipline

Do not add: real user accounts, email verification, push notifications, receipt OCR/scanning, live currency conversion, social features, multi-payer expenses (single payer per expense is the v1 standard), or shares/weights-based splitting. These are explicitly out of scope for v1. If a task description doesn't mention one of these, don't add it speculatively.

## Reporting

When a task is complete, produce a markdown summary of exactly what changed, file by file, and confirm the app builds and runs (`npm run build`). Save the report as a named `.md` file in the project root if the task instructions ask for one. Flag anything you were unsure about rather than guessing silently.
