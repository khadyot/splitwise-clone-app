# Comprehensive Codebase Audit Report: Splitwise

**Audit Date:** July 12, 2026  
**Target Repository:** `/Users/khadyot/Desktop/Ongoing/Projects_AI IDE/Splitwise`  
**Primary Active Prototype Directory:** `splitwise-v2/`

---

## Executive Summary

The workspace contains three top-level directory setups representing different iterations or scaffolding attempts:
1. **Root Directory (`/`)**: A Next.js 16 skeleton (`"splitwise-clone"`) where application directories (`app/`, `components/`, `lib/`) contain only empty subdirectories (`app/api/data`, `app/groups/[id]`, `components/ui`).
2. **`splitwise-web/`**: An identical copy of the root Next.js scaffolding (`"splitwise-clone"`) with completely empty structure.
3. **`splitwise-v2/`**: The **active, implemented prototype** (`"splitit" v0.1.0`). All analysis in this report focuses on the real application logic, UI components, data structures, and bugs present in `splitwise-v2/`.

---

## 1. Tech Stack & Architecture

### Framework, Language & Version Constraints
* **Framework:** Next.js `^16.1.4` using the App Router architecture (`app/` directory).
* **Core Library:** React `^19.2.3` (`react-dom: ^19.2.3`).
* **Language:** TypeScript `^5.9.3`. Target is `ES2017` with JSX set to `react-jsx` (`[tsconfig.json](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/tsconfig.json#L9-L25)`). Non-strict type checking is enabled (`"strict": false`).
* **Styling & UI:** Tailwind CSS `^4.1.18` (PostCSS `^8.5.6`) configured with custom brand colors (`#5bc5a7` teal, `#ff652f` red, `#333333` dark, `#eeeeee` gray) in `[tailwind.config.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/tailwind.config.ts#L11-L21)`. Utility class merging is handled by `clsx: ^2.1.1` and `tailwind-merge: ^3.4.0`.

### State Management Approach
* **Server-Side State:** Relies on Next.js **Server Actions** (`[actions.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts)`) and direct synchronous filesystem reads/writes (`[readData](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L46-L52)` and `[writeData](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L54-L56)`). There is no global client state store (such as Redux, Zustand, or Context API).
* **Client-Side State:** Client components like `[AddExpenseForm](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/AddExpenseForm.tsx#L18-L25)` use local React `useState` hooks to manage form inputs (`amount`, `splitType`, `splits`). When form submissions complete via React 19 `<form action={...}>`, server actions call `[revalidatePath](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L20)` to re-render server components.

### Local Persistence Layer & Schema
* **Engine:** Pure local filesystem JSON persistence. There is **no database engine** (no SQLite, Drift, Room, or Realm). Data is synchronously read from and written to `[data.json](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/data.json)` using Node.js `fs.readFileSync` and `fs.writeFileSync` in `[storage.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L46-L56)`.
* **Schema Definition (`[Data](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L40-L44)` interface in `storage.ts`):**

| Table / Collection | Column / Field | Type | Description |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` | `string` | 9-character alphanumeric ID (`generateId()`) |
| | `name` | `string` | User display name or prefix derived from email |
| | `email` | `string` | User email address |
| **`groups`** | `id` | `string` | 9-character alphanumeric ID (`generateId()`) |
| | `name` | `string` | Group title / name |
| | `members` | `string[]` | Array of `User.id` strings referencing member users |
| | `created_at` | `string` | ISO 8601 timestamp string |
| **`expenses`** | `id` | `string` | 9-character alphanumeric ID (`generateId()`) |
| | `groupId` | `string` | Foreign key referencing `Group.id` |
| | `description` | `string` | Title or description of the expense |
| | `amount` | `number` | Total cost of the expense |
| | `paidBy` | `[Payer](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L24-L27)[]` | Array of objects `{ userId: string, amount: number }` (*Note: runtime schema mismatch noted in Section 5*) |
| | `date` | `string` | ISO 8601 timestamp string |
| | `type` | `'EQUAL' \| 'EXACT' \| 'PERCENTAGE'` | The calculation method used to split the expense |
| | `splits` *(optional)* | `[Split](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L19-L22)[]` | Array of objects `{ userId: string, amount: number }` defining unequal/percentage allocations |

### Cloud Dependencies
* **Status:** **None**. There are no cloud authentication providers, remote databases, backend APIs, or synchronization services wired or stubbed.

### Navigation & Routing Structure
* Built entirely on Next.js App Router:
  * **Root Route (`/`)**: Serves the `[Home](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L10)` component (Dashboard displaying user balance overview and group list).
  * **Dynamic Group Route (`/groups/[id]`)**: Serves `[GroupPage](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L18)` (Group detail feed, quick-add expense form, member sidebar, and calculated group balances).
  * **Layout Wrap**: All routes are wrapped by `[RootLayout](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/layout.tsx#L10)` which applies global styles (`globals.css`) and `[Layout](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/ui/Layout.tsx#L27-L39)` which renders `[Navbar](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/ui/Layout.tsx#L5-L25)` and `[Sidebar](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L5-L77)`.

---

## 2. Feature Inventory

### Screen Inventory & Status

| Route / Screen | One-Line Description | Status (Wired vs. Stub / Placeholder) |
| :--- | :--- | :--- |
| **Dashboard (`/`)**<br>`[page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx)` | Lists user groups and provides a high-level summary of net balances across all groups. | **Partially Wired / Mostly Stubbed**:<br>• **Wired:** Reads real groups (`data.groups`) and links each group card to `/groups/[id]`.<br>• **Stubbed:** Header buttons `Add an expense` (`[page.tsx:L20](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L20)`) and `Settle up` (`[page.tsx:L21](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L21)`) are dead buttons. Total balance calculation is explicitly stubbed (`[page.tsx:L30-L39](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L30-L39)`) showing `$0.00`. Group card expense status is hardcoded as `"no expenses"` (`[page.tsx:L65](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L65)`). Right sidebar debts are hardcoded (`[page.tsx:L78, L81](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L78)`). Empty state `Create a group` button (`[page.tsx:L47](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L47)`) is dead. |
| **Group Detail (`/groups/[id]`)**<br>`[groups/[id]/page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx)` | Shows group expense feed, quick-add expense form, member list with invite input, and calculated net balances. | **Partially Wired with Major Data Bugs**:<br>• **Wired:** Renders real group title, members, and historical expenses. Inline `AddExpenseForm` calls `createExpense` server action. Member invite form (`[page.tsx:L167-L172](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L167-L172)`) calls `addMember`. Group Balances sidebar (`[page.tsx:L139-L151](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L139-L151)`) invokes `calculateBalances()` and displays real computed balances per member.<br>• **Stubbed:** Header button `Add an expense` (`[page.tsx:L54](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L54)`) is dead. Date header is hardcoded (`January 2025` at `[page.tsx:L78](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L78)`). `View printable summary` link (`[page.tsx:L79](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L79)`) is dead (`#`). Expense item summary displays hardcoded perspective `"you borrowed"` (`[page.tsx:L118](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L118)`) and simplified division (`[page.tsx:L121](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L121)`). Settle up form (`[page.tsx:L55-L57](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L55-L57)`) executes a destructive wipe instead of creating settlement records. |

### Core Functional Capability Analysis
1. **Group Creation:**  
   * Server action `[createGroup](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L6-L21)` exists in `actions.ts`. It takes `FormData`, generates an ID, and pushes a new `Group` object to `data.json`.
   * **Status: Unwired in UI**. There is no modal, form, or UI trigger on the Dashboard (`[page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx)`) to submit `createGroup`.
2. **Adding Members:**  
   * **Status: Fully Wired**. The inline form (`[groups/[id]/page.tsx:L167-L172](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L167-L172)`) submits an email to `[addMember](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L23-L47)`. If the email does not exist in `data.users`, a new user record is created (`name` derived from email prefix) and appended to `group.members`.
3. **Adding an Expense:**  
   * **Status: UI Wired, but Backend Data Pipeline is Broken (`[actions.ts:L49-L69](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L49-L69)`)**.
   * While `[AddExpenseForm.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/AddExpenseForm.tsx)` provides form controls for description, amount, paidBy, and split types (`EQUAL`, `EXACT`, `PERCENTAGE`), the server action `[createExpense](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L49-L69)` **only extracts `description`, `amount`, and `paidBy` (as a raw string ID)**.
   * `createExpense` completely ignores `splitType` and `splits` from `FormData`. Furthermore, because `paidBy` is saved as a `string` (`[actions.ts:L52](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L52)`: `formData.get('paidBy') as string`), it violates the type schema (`paidBy: Payer[]`), directly crashing or corrupting the balance calculation engine (`[logic.ts:L21](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L21)`).
4. **Splitting Logic (`EQUAL`, `UNEQUAL/EXACT`, `PERCENTAGE`, `SHARES`):**  
   * **In Engine (`[calculateBalances](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L8-L50)` in `logic.ts`)**:
     * **Equal**: Supported (`[logic.ts:L29-L35](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L29-L35)`). Splits amount equally across `group.members.length`.
     * **Unequal / Exact**: Supported (`[logic.ts:L36-L41](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L36-L41)`). Deducts `split.amount` for each member in `expense.splits`.
     * **Percentage**: Supported (`[logic.ts:L42-L49](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L42-L49)`). Deducts `(amount * split.amount) / 100` for each member.
     * **Shares**: **Not Supported**. No mathematical handling for share/weight ratios exists.
   * **In UI**: Because `AddExpenseForm` does not serialize individual splits into hidden `<input>` elements before submission and `createExpense` does not parse them, unequal and percentage splits cannot be saved.
5. **Balance & Debt Calculation:**  
   * **Status: Implemented & Wired on Group Page**. `[logic.ts:L8-L85](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L8-L85)` computes per-user net balances (`balances: Balance[]`) and simplifies pairwise debts (`debts: string[]`) using a greedy two-pointer loop. Wired on `/groups/[id]` (`[page.tsx:L29, L139-L151](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L29)`); stubbed on `/` (`[page.tsx:L30](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L30)`).
6. **Settle-Up Flow:**  
   * **Status: Destructive Stub (`[actions.ts:L71-L77](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L71-L77)`)**.
   * Clicking "Settle up" on the Group detail page executes `[settleUp](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L71-L77)`. Instead of creating settlement records (`Settlement` or balance zeroing transactions), the action **permanently deletes all expenses** associated with `groupId`:
     ```typescript
     data.expenses = data.expenses.filter(e => e.groupId !== groupId);
     ```
7. **Activity / History Feed:**  
   * **Status: Stubbed / Non-Existent**. Navigation links to `Recent Activity` (`[Sidebar.tsx:L19-L25](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L19-L25)`) and `All expenses` (`[Sidebar.tsx:L26-L32](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L26-L32)`) point directly back to `/` (`href="/"`). No audit log or activity history entity exists.

### Native Platform Code
* **None.** There is zero Kotlin, Swift, or Java code. This is purely a web application.

---

## 3. Data Model

### Entities & Fields (`[storage.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts)`)

```typescript
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Group {
    id: string;
    name: string;
    members: string[]; // Foreign keys -> User.id
    created_at: string;
}

export interface Payer {
    userId: string; // Foreign key -> User.id
    amount: number;
}

export interface Split {
    userId: string; // Foreign key -> User.id
    amount: number; // Exact dollar amount or percentage figure
}

export interface Expense {
    id: string;
    groupId: string; // Foreign key -> Group.id
    description: string;
    amount: number;
    paidBy: Payer[]; // Intended array of payers (bugged at runtime to string)
    date: string;
    type: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
    splits?: Split[];
}

export interface Data {
    users: User[];
    groups: Group[];
    expenses: Expense[];
}
```

### Entity Relationships
* **`Group` $\leftrightarrow$ `User` (Many-to-Many via embedded ID array)**: `Group.members` stores an array of `User.id` strings.
* **`Expense` $\rightarrow$ `Group` (Many-to-One)**: `Expense.groupId` links directly to `Group.id`.
* **`Expense.paidBy` $\rightarrow$ `User` (Many-to-Many)**: Embedded `Payer` objects contain `userId` referencing `User.id`.
* **`Expense.splits` $\rightarrow$ `User` (Many-to-Many)**: Embedded `Split` objects contain `userId` referencing `User.id`.
* **Missing Entities**: No `Settlement` table exists to record debt repayments without destroying expense logs. No `Activity` log exists.

### Balance & Debt Calculation Logic
* **Location:** `[splitwise-v2/lib/logic.ts](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts)` inside `[calculateBalances(group, expenses, users)](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L8-L85)`.
* **Step 1: Net Balance Accumulation (`[logic.ts:L16-L50](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L16-L50)`)**:
  * Initializes `balances[memberId] = 0`.
  * Iterates `expenses`: adds `payer.amount` to `balances[payer.userId]` for each payer in `paidBy`.
  * Deducts from member balances based on `expense.type` (`EQUAL` divides by `members.length`, `EXACT` deducts `split.amount`, `PERCENTAGE` deducts `(amount * split.amount) / 100`).
* **Step 2: Pairwise Debt Simplification (`[logic.ts:L56-L83](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L56-L83)`)**:
  * Sorts users into `debtors` (`amount < -0.01`) and `creditors` (`amount > 0.01`).
  * Uses a greedy two-pointer loop matching `debtor[i]` with `creditor[j]`. Settles $\min(|debtor.amount|, creditor.amount)$ and emits a readable string: `${debtorName} owes ${creditorName} $${amount.toFixed(2)}`.

### Seed & Demo Data Utilities
* **None.** There are no programmatic seed scripts or demo data generators anywhere in the repository.
* The only starter data is the hardcoded initial state in `[data.json](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/data.json#L1-L35)` containing 2 users (`"fe"`, `"ww"`), 1 group (`"Khadyot"` with ID `udft0uukk`), and 1 expense (`"vrv"`, amount `22`). Notably, `data.json:L31` stores `"paidBy": "8x742vkzi"` as a string, already corrupting the defined `Payer[]` schema.

---

## 4. Dependencies

### Full Inventory (`[package.json](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/package.json)`)

| Package | Version | Purpose | Usage Status |
| :--- | :--- | :--- | :--- |
| `next` | `^16.1.4` | App Router, Server Actions, API rendering | Actively Used (`actions.ts`, `page.tsx`, etc.) |
| `react` | `^19.2.3` | UI Component architecture | Actively Used |
| `react-dom` | `^19.2.3` | React DOM rendering engine | Actively Used |
| `clsx` | `^2.1.1` | Conditional CSS class string construction | Actively Used via `[utils.ts:cn()](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/utils.ts#L1-L3)` |
| `tailwind-merge` | `^3.4.0` | Merging conflicting Tailwind utility classes | Actively Used via `[utils.ts:cn()](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/utils.ts#L1-L3)` |
| `lucide-react` | `^0.563.0` | UI icons (`Users`, `Home`, `Activity`, `List`, `Plus`) | Actively Used (`[page.tsx:L8](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L8)`, `[Sidebar.tsx:L3](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L3)`) |
| `typescript` *(dev)* | `^5.9.3` | Static type checking and compilation | Actively Used |
| `tailwindcss` *(dev)* | `^4.1.18` | Utility-first CSS engine | Actively Used (`[globals.css](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/globals.css)`) |
| `postcss` *(dev)* | `^8.5.6` | CSS transformation engine for Tailwind | Actively Used |
| `autoprefixer` *(dev)* | `^10.4.23` | Vendor prefix injection for CSS | Actively Used |
| `eslint` *(dev)* | `^9.39.2` | Linter | Actively Used |
| `eslint-config-next` *(dev)* | `^16.1.4` | Next.js specific lint rules | Actively Used |
| `@types/node` *(dev)* | `^25.0.10` | TypeScript definitions for Node.js (`fs`, `path`) | Actively Used (`[storage.ts:L1-L2](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L1-L2)`) |
| `@types/react` *(dev)* | `^19.2.9` | TypeScript definitions for React 19 | Actively Used |
| `@types/react-dom` *(dev)* | `^19.2.3` | TypeScript definitions for React DOM | Actively Used |

### Unused Dependencies
* Within `splitwise-v2/`, **all declared dependencies are actively utilized**.
* However, in the root (`/package.json`) and `splitwise-web/package.json`, every runtime dependency (`clsx`, `lucide-react`, `tailwind-merge`) is technically unused because their source code directories (`app/`, `components/`) are completely empty skeletons.

### Architecture & Philosophy Check (Local-First / Privacy-First)
* **No Conflicting Dependencies:** There are zero cloud SDKs, tracking libraries, remote analytics, or external telemetry modules.
* **Current Commitment & Open Architectural Question:** The codebase commits to a **zero-telemetry, local-only** design (`[storage.ts:L46](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L46)` writing directly to `data.json`). However, because it relies on Node.js `fs.readFileSync` inside a Next.js server environment rather than browser-native persistence (like IndexedDB, PouchDB, or local SQLite/Drift via WASM), it currently behaves as a single-node local server rather than true local-first client software. Whether `data.json` over `fs` is intended as the final architecture or as a temporary server-action mock before moving to SQLite/IndexedDB remains an open architectural question.

---

## 5. Known Issues & Incomplete Work

### Dead Buttons, Empty Callbacks, Hardcoded Strings & TODO Comments

| File & Line Reference | Item Type | Details |
| :--- | :--- | :--- |
| `[splitwise-v2/app/layout.tsx:L2](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/layout.tsx#L2)` | Comment Note | `// import localFont from "next/font/local"; // Skipping local fonts to minimize asset issues` |
| `[splitwise-v2/app/actions.ts:L31, L36](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L31)` | Comment Note | `// Simple logic: If user exists, add ID. If not, create user.`<br>`name: email.split('@')[0], // Simple name derivation` |
| `[splitwise-v2/app/actions.ts:L72](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L72)` | TODO / Stub | `// For MVP: simple delete all expenses for this group` inside `settleUp()`. |
| `[splitwise-v2/app/page.tsx:L20](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L20)` | Dead Button | `<Button size="sm"...>Add an expense</Button>` on Dashboard has no modal or event attached. |
| `[splitwise-v2/app/page.tsx:L21](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L21)` | Dead Button | `<Button size="sm" variant="secondary">Settle up</Button>` on Dashboard has no event or form. |
| `[splitwise-v2/app/page.tsx:L30](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L30)` | TODO Comment | `{/* Placeholder for total balance calculation */}` |
| `[splitwise-v2/app/page.tsx:L34, L38](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L34)` | Hardcoded String | Hardcoded `$0.00` for `you owe` and `you are owed` balances. |
| `[splitwise-v2/app/page.tsx:L47](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L47)` | Dead Button | `<Button variant="outline" size="sm">Create a group</Button>` in empty state is dead. |
| `[splitwise-v2/app/page.tsx:L65](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L65)` | Hardcoded String | `<p className="text-xs text-gray-400">no expenses</p>` inside group card listing. |
| `[splitwise-v2/app/page.tsx:L78, L81](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L78)` | Hardcoded String | `"You do not owe anything"` and `"You are not owed anything"` in right sidebar. |
| `[splitwise-v2/app/groups/[id]/page.tsx:L42](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L42)` | Comment Note | `<Users className="h-6 w-6" /> // Placeholder for group image` |
| `[splitwise-v2/app/groups/[id]/page.tsx:L54](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L54)` | Dead Button | Header `<Button className="bg-brand-red...">Add an expense</Button>` is dead. |
| `[splitwise-v2/app/groups/[id]/page.tsx:L64](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L64)` | Comment Note | `{/* Inline Add Expense for ease of use, though typically modal */}` |
| `[splitwise-v2/app/groups/[id]/page.tsx:L78](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L78)` | Hardcoded String / TODO | `<h2...>January 2025</h2> {/* Mock Date Header */}` |
| `[splitwise-v2/app/groups/[id]/page.tsx:L79](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L79)` | Stub Link | `<Link href="#"...>View printable summary</Link>` is a dead hash link. |
| `[splitwise-v2/app/groups/[id]/page.tsx:L118](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L118)` | Hardcoded String / TODO | `<p...>you borrowed</p> {/* Hardcoded perspective for demo */}` |
| `[splitwise-v2/app/groups/[id]/page.tsx:L120-L121](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L120-L121)` | Simplified Mock / TODO | `{/* Simplify display logic for demo */}` with naive division `expense.amount / group.members.length`. |
| `[splitwise-v2/components/Sidebar.tsx:L19-L32](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L19-L32)` | Stub Links | Links for `Recent Activity` and `All expenses` point to `/` (`href="/"`). |
| `[splitwise-v2/components/Sidebar.tsx:L40, L66](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L40)` | Dead Links | Plus icons (`<Plus />`) beside `Groups` and `Friends` link to `/` (`href="/"`). |
| `[splitwise-v2/components/Sidebar.tsx:L71-L72](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/Sidebar.tsx#L71-L72)` | TODO / Stub Text | `{/* Friends list would go here */} Pending feature` |
| `[splitwise-v2/components/ui/Layout.tsx:L14-L20](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/ui/Layout.tsx#L14-L20)` | Hardcoded Profile | Hardcoded user name `Khadyot` and avatar `K` along with `{/* Avatar would go here */}`. |
| `[splitwise-v2/lib/logic.ts:L56-L57](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L56-L57)` | Comment Note | `// Simplify debts (who owes whom) // This is a naive greedy algorithm for simplifying debts` |

### Crashes & Runtime Errors Identified from Code Inspection

1. **Schema Mismatch Runtime Crash (`Expense.paidBy` Type Mismatch)**:
   * **Root Cause:** In `[storage.ts:L34](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L34)`, `Expense.paidBy` is typed as `Payer[]` (`[{ userId: string, amount: number }]`). In `[logic.ts:L21](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L21)`, `calculateBalances()` calls `expense.paidBy.forEach(...)` and accesses `payer.userId` and `payer.amount`.
   * **The Bug:** In `[actions.ts:L52, L62](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L52)`, `createExpense()` reads `paidBy` from the form as a raw string ID (`const paidBy = formData.get('paidBy') as string;`) and assigns it directly to `Expense.paidBy`. Similarly, `[data.json:L31](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/data.json#L31)` stores `"paidBy": "8x742vkzi"`.
   * **Impact:** When `calculateBalances()` executes on any newly created expense or existing seed data, calling `.forEach()` on a string either throws `TypeError: expense.paidBy.forEach is not a function` OR loops through characters, where accessing `payer.userId` yields `undefined`, producing `NaN` and crashing the calculation table.
2. **Undefined Property Access Crash on Expense Feed Rendering (`paidBy` array vs string)**:
   * **Root Cause:** In `[groups/[id]/page.tsx:L110-L113](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/groups/%5Bid%5D/page.tsx#L110-L113)`, the UI checks:
     ```tsx
     {expense.paidBy.length > 1
         ? `${expense.paidBy.length} people paid`
         : `${getUserName(expense.paidBy[0].userId)} paid`
     }
     ```
   * **The Bug:** Because `paidBy` is stored as a raw string (e.g., `"8x742vkzi"`), `expense.paidBy.length` evaluates to `9` (the character count of the string ID!). Therefore, it renders `9 people paid` instead of single payer details. If `paidBy` is a 1-character string, `expense.paidBy[0]` returns a string character (e.g., `'8'`), and accessing `'8'.userId` returns `undefined`, causing `getUserName(undefined)` to render `"Unknown paid"`.
3. **Unprotected JSON Parse / File I/O Crash**:
   * **Root Cause:** In `[storage.ts:L50-L51](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/storage.ts#L50-L51)`, `readData()` calls `fs.readFileSync(DATA_FILE, 'utf-8')` directly followed by `JSON.parse(fileContent)`.
   * **Impact:** If `data.json` is empty, corrupted by a partial write, or locked during concurrent Next.js server requests, `JSON.parse()` throws an uncaught `SyntaxError: Unexpected end of JSON input`, taking down the entire page render with a 500 Server Error.
4. **Missing Null/Undefined Checks on Form Number Parsing**:
   * **Root Cause:** In `[actions.ts:L51](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L51)`, `createExpense` executes `const amount = Number(formData.get('amount'));` and checks `if (!amount) return;`. If a user inputs `$0` or invalid number format, `Number()` yields `NaN` or `0`, silently aborting execution without returning any feedback or error state to the UI.

### Incomplete / Placeholder Currency Formatting (`$` vs `₹`)
* **Status:** The codebase exclusively hardcodes US Dollars (`$`) across all utilities, UI inputs, and summary strings. There is **zero usage of `₹` (INR)** anywhere in the project.
* **Exact Locations:**
  * `[splitwise-v2/lib/utils.ts:L5-L10](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/utils.ts#L5-L10)`: `formatCurrency()` hardcodes `en-US` locale with `currency: 'USD'`.
  * `[splitwise-v2/app/page.tsx:L34, L38](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx#L34)`: Dashboard balance boxes hardcode `$0.00`.
  * `[splitwise-v2/components/AddExpenseForm.tsx:L35, L93](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/AddExpenseForm.tsx#L35)`: Form label hardcodes `Amount ($)` and placeholder `$0.00`.
  * `[splitwise-v2/lib/logic.ts:L75](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/logic.ts#L75)`: Pairwise debt summary output hardcodes `$` symbol: `${debtorName} owes ${creditorName} $${amount.toFixed(2)}`.

---

## 6. Completion Estimate

### Percentage Estimate: **35% – 40%**

### Reasoning
The repository possesses a clean, visually polished foundation (`splitwise-v2/`) built with Next.js 16 App Router and Tailwind CSS, along with an algorithmically sound calculation engine (`calculateBalances` in `logic.ts`) capable of equal, exact, and percentage splits as well as debt simplification. However, as an interactive demonstration or portfolio project, it is only roughly **35% to 40% complete**. 

The primary deficit is that the data pipeline connecting UI forms (`AddExpenseForm`) and server actions (`actions.ts`) to the backend schema and calculation engine (`logic.ts`) is structurally broken: storing single string IDs instead of `Payer[]` objects and completely discarding unequal/percentage split form data (`splitType`, `splits`) upon submission. Furthermore, key user flows are dead stubs—specifically, group creation cannot be initiated from the UI, the Dashboard balance summary is hardcoded to `$0.00`, settlement (`settleUp`) destructively wipes expense records instead of creating balancing ledger entries, and the entire app lacks multi-user context or currency localization (`₹`).

### Prioritized Roadmap to Portfolio-Ready State

1. **Fix Critical Schema & Data Serialization Pipeline Bug (`Expense.paidBy` & `splits`)**  
   * Modify `[createExpense](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L49-L69)` (`actions.ts`) and `[AddExpenseForm.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/components/AddExpenseForm.tsx)` to properly serialize and save `paidBy` as `[{ userId: paidByString, amount: totalAmount }]` (or support multi-payer inputs), and parse `splitType` along with individual `splits` (`EXACT`/`PERCENTAGE`) into the `Expense` object so `calculateBalances` works without runtime crashes. Update `data.json:L31` to match `Payer[]`.
2. **Wire Up Dashboard Data & Group Creation UI**  
   * Add a "Create Group" modal/dialog on the Dashboard (`[page.tsx](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/page.tsx)`) connected to `[createGroup](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L6-L21)`.
   * Wire the Dashboard balance summary (`page.tsx:L30`) by invoking `calculateBalances()` across all user groups to compute dynamic "you owe / you are owed" totals instead of hardcoded `$0.00`. Replace hardcoded `"no expenses"` group card labels with actual group expense summaries.
3. **Refactor Settle-Up into Non-Destructive Ledger Transactions**  
   * Replace the destructive wiping logic in `[settleUp](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/app/actions.ts#L71-L77)` (`data.expenses = data.expenses.filter(...)`) with a true settlement ledger that inserts a zeroing transaction (or `Settlement` record) paying off debts between users while preserving historical expense logs.
4. **Localize Currency Formatting to Indian Rupees (`₹` / INR)**  
   * Update `[formatCurrency()](file:///Users/khadyot/Desktop/Ongoing/Projects_AI%20IDE/Splitwise/splitwise-v2/lib/utils.ts#L5-L10)` in `utils.ts` to use `en-IN` locale and `currency: 'INR'`. Replace hardcoded `$` signs across `AddExpenseForm.tsx`, `logic.ts`, and `page.tsx` with `₹`.
5. **Implement User Context / Perspective Switcher**  
   * Replace hardcoded profile strings (`"Khadyot"` in `Layout.tsx:L15`) and hardcoded perspective strings (`"you borrowed"` in `groups/[id]/page.tsx:L118`) with a user selector or basic active session state so the application dynamically calculates "borrowed vs. lent" from the currently active user's perspective.
6. **Clean Up Workspace Scaffolding**  
   * Remove or consolidate the empty root scaffolding directories (`app/`, `components/`, `lib/`) and `splitwise-web/` so that `splitwise-v2/` serves as the unambiguous, standalone project root.
