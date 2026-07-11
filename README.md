# SplitIt

A free, no-account, one-off expense-splitting web application built with Next.js 16 and Supabase.

This is a direct answer to the most common friction points in expense splitting apps: forced signup for every participant, daily expense caps, and paywalled basic features. 

With SplitIt, a person creates a group, gets a short join code, and shares it. Everyone joins by entering the code and their name. Nobody signs up. Nobody creates a password. When the trip or dinner is over, everyone settles up and walks away.

## Key Features

- **No User Accounts:** Identity is handled entirely via group-level `participants` and guest sessions. No passwords, no emails, no auth friction.
- **Dynamic Currency:** Every group has its own independent currency (e.g., INR, USD, EUR, GBP) set at creation.
- **Non-Destructive Ledger:** Settling up records a new settlement transaction rather than mutating or deleting historical expense rows.
- **Modern Clean UI:** A beautiful, responsive card-based interface with pastel category badges and clean typography.
- **Fast Join Flow:** Joining a group is as simple as entering a 6-character code on the front page.

## Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (Postgres)
- **Data Fetching:** Next.js Server Actions + `revalidatePath` (No client-side Supabase calls)
- **State:** Pure server-rendered UI, keeping client-side state minimal
- **Deployment:** Vercel (Target)

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
SUPABASE_URL="your-project-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```
*Note: We strictly use the service role key server-side because there is no Supabase Auth configured. The client never accesses Supabase directly.*

### 3. Run Migrations
Ensure your Supabase project is set up with the provided schema in `supabase/migrations/0001_init.sql`. You can run this schema in the Supabase SQL editor.

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to start building and splitting!

## Architecture Rules

- **No Accounts:** Never add Supabase Auth, OAuth, or email links.
- **Web-Only:** No native mobile bindings. The web app is fully responsive for all devices.
- **Single Source of Truth:** All database operations route through `lib/supabase.ts` on the server (`app/actions.ts`).

## Project Status
Currently in **v1 (Feature Complete)**. Supported splits: Equal, Exact, Percentage.
