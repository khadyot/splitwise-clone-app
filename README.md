# SplitIt

A free, no-account, one-off expense-splitting web application built with **Next.js 16**, **TypeScript**, **React 19**, **Tailwind CSS v4**, and **Supabase (Postgres)**.

---

## What is SplitIt & Why Does It Exist?

SplitIt is a direct answer to modern expense app complaints: forced signup for every single participant, restrictive daily expense logging caps, and aggressive Pro paywalls for basic bill-splitting functionality.

When you're out for dinner, on a weekend road trip, or splitting Airbnb groceries with friends, forcing everyone to download an app, verify their email, and remember a password creates unnecessary friction. 

**SplitIt eliminates this friction entirely:**
1. **Zero Accounts Required:** A group creator sets up a group in two clicks and receives a 6-character uppercase alphanumeric join code (`e.g., TRIP26`).
2. **Instant Joining:** Friends enter the code and their display name on the landing page or `/join`. That's it—no passwords, no email verification, no magic links.
3. **No Limits & No Paywalls:** Log as many expenses as you want, split by **Equal**, **Exact**, or **Percentage** amounts, and settle up whenever ready—100% free forever.
4. **Walk Away Cleanly:** When the trip or dinner is over, everyone can settle their balances and never open the app again.

---

## Tech Stack & Architecture

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) with [TypeScript](https://www.typescriptlang.org) & [React 19](https://react.dev)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with curated HSL design tokens, responsive cards, and clean pastel typography
- **Persistence:** [Supabase](https://supabase.com) (Postgres), accessed exclusively via Node.js Server Actions
- **State & Data Flow:** Next.js Server Actions (`app/actions.ts`) + `revalidatePath`. Zero client-side Supabase requests or client-side auth bundles
- **Hosting Target:** [Vercel](https://vercel.com) (Responsive Web App — fully optimized for mobile browsers and desktops alike)

### Core Architectural Principles

1. **No Accounts, Ever:** Identity is managed via `participants` rows linked to a device-local `session_token` stored in `localStorage`. There is no email/password auth, no OAuth, and no Supabase Auth.
2. **Non-Destructive Ledger:** Settling up never mutates or deletes historical expense rows. Instead, it appends an immutable `settlements` record (`cash`, `transfer`, or `other`) that reconciles balances.
3. **Dynamic Currency:** No hardcoded currency symbols (`$` or `₹`). Every group stores its own ISO 4217 currency code (`USD`, `EUR`, `INR`, `GBP`, etc.), and all values format dynamically based on the group's currency setting.
4. **Server-Side Only Credentials:** Supabase keys (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are accessed strictly on the server within Server Actions. No database credentials ever leak to the client bundle (`_next/static/`).

---

## Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js 20+** and **npm** installed on your machine.

### 2. Install Dependencies
Clone the repository and install all required Node packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file at the root of the project with your Supabase credentials:
```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```
> [!IMPORTANT]
> Because there is no client-side Supabase Auth, we use the `SUPABASE_SERVICE_ROLE_KEY` exclusively within server-side Node execution (`lib/supabase.ts` via `'use server'` actions). Do not prefix these variables with `NEXT_PUBLIC_`, ensuring Next.js strips them from all client bundles.

### 4. Apply Database Migration
Initialize your Supabase Postgres database using our locked schema located at `supabase/migrations/0001_init.sql`:

**Option A: Supabase Dashboard (SQL Editor)**
1. Open your Supabase project dashboard and navigate to **SQL Editor**.
2. Copy the entire contents of `supabase/migrations/0001_init.sql`.
3. Paste into a new query tab and click **Run** to create the `groups`, `participants`, `expenses`, `expense_splits`, and `settlements` tables with cascading foreign keys.

**Option B: Supabase CLI**
If you have the Supabase CLI installed and linked to your project:
```bash
supabase db push
```

### 5. Start Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the landing page, create groups, and split expenses!

---

## The `.agents/` Skill System & Project Conventions

SplitIt uses an automated agent skill and governance structure housed inside `.agents/` to maintain strict project standards and prevent architectural drift across AI and human contributions.

### `AGENTS.md` (Project Identity & Rules)
Located at `.agents/AGENTS.md`, this file defines the non-negotiable scope, identity, and conventions of the codebase. Every developer or AI agent must read `AGENTS.md` before making any modification.

### Specialized Agent Skills (`.agents/skills/`)
The `.agents/skills/` directory contains modular instruction checklists (`SKILL.md`) governing specific domains of the application:

| Skill | Directory | Purpose & Governance |
| :--- | :--- | :--- |
| **Guest Identity Guard** | `skills/guest-identity-guard/` | Enforces the no-account principle. Prohibits adding email auth, OAuth, or required phone/email fields. Details how `session_token` inside `localStorage` identifies returning participants. |
| **Supabase DB Management** | `skills/supabase-db-management/` | Defines the locked Postgres schema (`groups`, `participants`, `expenses`, `expense_splits`, `settlements`) and server-action-only data access rules. |
| **Currency Localization** | `skills/currency-localization/` | Ensures all components pass `currencyCode` explicitly to `formatCurrency()`, prohibiting hardcoded currency symbols or fallback defaults. |
| **Design Aesthetics** | `skills/design-aesthetics/` | Governs UI guidelines: vanilla HSL styling tokens, clean typography, vibrant pastel badges, and modern card layouts without placeholder junk. |
| **Neon & Postgres Guides** | `skills/neon/` & `skills/neon-postgres/` | Best practices and reference guides for working with serverless Postgres drivers, connection pooling, and autoscaling. |

Whenever adding new actions or modifying components, refer directly to these skill checklists to ensure 100% adherence to project conventions.

---

## License & Contributing

Built with ❤️ for hassle-free group travel and dining. Licensed under the MIT License.
