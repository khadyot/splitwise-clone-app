# SplitIt — Project Summary & Architecture Overview

### What was built

SplitIt is a free, no-account, one-off expense-splitting web application built to eliminate the friction inherent in modern shared expense trackers. When friends go on a weekend trip, share dinner bills, or split vacation house groceries, forcing every participant to download a proprietary app, verify their email address, remember passwords, or hit daily entry limits (`e.g., Splitwise's 3-expense cap for free users`) creates an unnecessary barrier to collaboration. SplitIt solves this by removing user accounts entirely: one person creates a group in two clicks and receives a 6-character uppercase alphanumeric join code (`e.g., TRIP26`); everyone else enters the code and their display name on the web to start logging expenses instantly, with full access to unequal and exact splitting options completely free forever.

---

### Live links

- **Production URL:** [https://split-it-2026.vercel.app](https://split-it-2026.vercel.app)
- **GitHub repo:** [https://github.com/khadyot/split-it-2026](https://github.com/khadyot/split-it-2026)

---

### Tech stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 | Server-first web application providing static landing pages, dynamic group routing (`/groups/[id]`), and high-performance Server Actions. |
| **Language** | TypeScript | Type safety across database schemas, server actions, and UI component props. |
| **Styling** | Tailwind CSS v4 | Responsive, mobile-friendly interface styled with curated HSL color tokens, clean typography, and vibrant pastel category badges. |
| **Database** | Supabase (Serverless Postgres) | Persistent cloud relational database supporting concurrent multi-user group synchronization across devices. |
| **Data Access** | Node.js Server Actions + `revalidatePath` | Server-only data mutations (`app/actions.ts`) with zero client-side Supabase credentials or auth bundles. |
| **Hosting & Deployment** | Vercel | Edge-optimized serverless deployment with instant route pre-rendering and dynamic server execution. |

---

### Feature summary

- **Instant Group Creation:** Create a shared ledger in seconds with a custom name and dynamic ISO 4217 currency selection.
- **Join by Code:** 6-character uppercase alphanumeric join codes allow anyone with the code to enter their display name and join the group instantly.
- **Versatile Expense Tracking:** Log shared expenses across multiple categories (`Food`, `Transport`, `Housing`, `Entertainment`, `General`) using **Equal**, **Exact**, or **Percentage** split methods.
- **Non-Destructive Settle-Up:** Reconcile group balances through explicit cash, bank transfer, or custom settlement records (`settlements` table) that preserve full historical expense clarity.
- **Multi-Currency Localization:** Dynamic currency formatting (`formatCurrency`) across all group components based on the group's chosen currency setting (`USD`, `EUR`, `INR`, `GBP`, etc.).
- **Edit & Delete Expenses:** Full lifecycle management allowing any group participant to modify expense descriptions, amounts, payers, and per-person split values or permanently delete accidental entries.
- **Remove Participants (Zero-Balance Guard):** Cleanly remove participants who have a net-zero balance (`$0.00`) and no attached expense history without breaking group accounting calculations.
- **Leave & Delete Group:** Empower group members to exit settled groups or delete completed trips and their entire cascading transaction history (`groups`, `participants`, `expenses`, `settlements`).
- **Guest Identity via Session Token:** Device-local session recognition (`localStorage` + UUID token) that remembers returning users on the same device without requiring a login screen or password.
- **Copy Join Link Recovery Path:** One-click sharable URL generation (`/join?code=XXXXXX`) so group creators can drop direct invite links into group chats as an instant anchor for new or returning devices.

---

### Architecture decisions worth noting

#### Why Supabase over local storage or filesystem JSON
A local filesystem approach (`fs.writeFileSync` to `data.json`) cannot function in a modern serverless deployment environment like Vercel, where serverless functions do not guarantee persistent or writable disk storage between invocations. Furthermore, expense splitting is inherently a multiplayer activity requiring real-time consistency across multiple devices and users concurrently. Supabase Postgres provides a robust, ACID-compliant cloud relational database (`groups`, `participants`, `expenses`, `expense_splits`, `settlements`) that serves as the single source of truth for all group activity while keeping query execution strictly bounded to server-side Node execution (`lib/supabase.ts`).

#### How guest identity works without accounts
To preserve a completely accountless user experience while preventing duplicate participant entries every time a user refreshes their browser, SplitIt implements a guest identity handshake. When a user joins a group by entering a name and join code, the server creates (or verifies) a `participants` row and issues a unique UUID `session_token`. This token is saved client-side inside `localStorage` keyed by `group_id`. When the user revisits `/groups/[id]`, the `GroupIdentityGuard` checks `localStorage` and automatically recognizes the device (`"You are joined as Alex"`). If the token is lost or the user switches devices, they simply re-enter the join code and select their name to re-anchor their session.

#### Why settle-up is non-destructive
In many simple accounting tools, settling a balance mutates or deletes the underlying expense records to zero out what is owed. This is an anti-pattern that destroys historical auditability and confuses group members trying to review past spending. SplitIt treats the ledger as immutable: `calculateBalances()` computes net positions dynamically by summing what each person paid (`expenses.paid_by`), subtracting what they consumed (`expense_splits.amount`), and factoring in explicit settlement transactions (`settlements.amount`). When two people settle up, the app appends a new row to the `settlements` table (`from_participant`, `to_participant`, `amount`, `method`), keeping the expense history 100% intact and traceable.

#### The no-account trust model (equal permissions, no owner role)
Because SplitIt is designed for casual, one-off groups (trips, dinners, shared gifts) rather than corporate accounting or long-term tenancy, the app avoids introducing hierarchical role checks, permission gating, or a "group owner" concept. Every participant who has joined a group operates with equal standing under a high-trust peer model. Anyone can log an expense, edit a typo in a bill, record a settlement, or delete a group when the trip concludes. Eliminating role boundaries ensures zero administrative bottlenecks when someone needs to adjust a split on the go.

---

### Known limitations and future scope

- **No cross-device automatic sync:** Because identity is anchored to a device-local `session_token` in `localStorage` rather than a centralized cloud account, switching from a phone to a laptop requires re-entering the group's 6-character join code.
- **No push notifications:** The app is purely web-based (`Next.js App Router`) and does not send native mobile push alerts or SMS notifications when a new expense is added or a balance is settled.
- **No receipt scanning or OCR:** Entering expenses relies on clean, rapid manual input rather than automated AI/OCR itemized receipt scanning.
- **Single payer per transaction:** For simplicity in v1, every expense assigns exactly one `paid_by` participant. Multi-payer splits (where two people split paying the initial restaurant bill) must be logged as separate transactions.
- **Mobile edit split layout polish:** While responsive across mobile browsers (`375px` width verified), the vertical spacing inside the multi-tab unequal/percentage split editor inside `AddExpenseForm` and `ExpenseItem` edit states could benefit from further ergonomics and touch-target refinement in future iterations.
