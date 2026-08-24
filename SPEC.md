# [SPEC] Product A — minimal customer auth

- Objective: Let a customer sign up and log in, producing a real `customer_id` that
  order-placement (a later spec) can attach to an `orders` row — replacing the choice we already
  ruled out of guessing or hardcoding one.
- Approach: Use Supabase Auth (email + password) for credential handling — it's already in the
  confirmed stack and already does password hashing/session management correctly; hand-rolling
  that is exactly the kind of security-sensitive work this codebase shouldn't take on itself.
  On successful sign-up, insert a row into a new `customers` table (`customer_id` text PK,
  DB-generated in the shared `cust_XXXXX` format via a Postgres sequence — see Open Question 2,
  resolved below — `auth_user_id` uuid referencing Supabase's `auth.users.id`, `signup_date`
  date) from the client, right after `supabase.auth.signUp()` succeeds. Login checks for a
  missing `customers` row and creates one if absent, so a partial failure between the two inserts
  (network blip) doesn't permanently strand a user. Plain client-side Supabase Auth calls, not a
  Next.js Server Action — route guarding via server-side session checks is explicitly deferred
  (see Edge Cases), so there's no server-only auth state to manage yet.
  Alternative considered: a Postgres trigger on `auth.users` insert instead of an app-level
  second insert — more atomic, but adds a piece of DB logic that isn't visible from this repo and
  that whoever owns the Supabase project would need to maintain by hand outside git. Rejected for
  this first slice in favor of the simpler, fully-in-repo app-level approach; worth revisiting if
  the login-time backfill turns out to be flaky in practice.
- Inputs/Outputs:
  - `/signup`: email + password form → `supabase.auth.signUp()` → create `customers` row.
  - `/login`: email + password form → `supabase.auth.signInWithPassword()` → backfill
    `customers` row if missing.
  - Session: Supabase Auth's browser client persists the session itself (default behavior, no
    custom cookie handling needed). A helper reads the current `customer_id` for later use by
    order placement.
  - New table `customers` (Product-A-internal — see Open Question 1 on whether this needs a
    full-team nod or not): `customer_id` (text, PK, `cust_XXXXX`), `auth_user_id` (uuid, unique,
    references `auth.users.id`), `signup_date` (date).
- Verification: `npm run build` typechecks. Manual flow against a configured Supabase project
  with Auth enabled: sign up with a test email, confirm a matching `customers` row appears; log
  out, log back in, confirm the session persists across a reload; try signing up twice with the
  same email, confirm Supabase Auth's own duplicate-email error surfaces instead of a crash.
  **Cannot be run in this session** — no Node.js runtime, no live Supabase project.
- Files: `apps/product-a/lib/auth.ts` (sign-up/sign-in/sign-out wrappers, ensure-customer-row
  logic, and current-customer-id helper — kept in one file since they're all "who is the current
  customer" concerns), `apps/product-a/app/signup/page.tsx`, `apps/product-a/app/login/page.tsx`,
  `apps/product-a/SESSION_STATE.md`. Also adding two Supabase SQL migrations
  (`apps/product-a/supabase/migrations/0001_books.sql`, `.../0002_customers.sql`) — not counted
  against the 5-file cap as new product logic; they're setup SQL so the `books` table from the
  catalog-browse spec and the new `customers` table are both actually creatable, since neither
  had a checked-in migration before now.
- Edge Cases: signup succeeds in Supabase Auth but the `customers` insert fails — handled by the
  login-time backfill described above, not a silent stuck account. Duplicate email — surface
  Supabase Auth's own error, don't write a second `customers` row. Logged-out user hitting
  `/cart` — explicitly out of scope for this spec; route guarding is the order-placement spec's
  job, not this one's.
- Open Questions — resolved by Jeffrey, 2026-08-24:
  1. **`customers` table is Product-A-internal plumbing**, not a schema change — no full-team nod
     needed. `customer_id`'s meaning in the shared schema is unchanged; this table just owns how
     Product A issues one.
  2. **`customer_id` is sequential**, matching the synthetic dataset's `cust_XXXXX` style — a
     Postgres sequence, not a random suffix. The synthetic dataset
     (`docs/schema/riverside-books-integration-chaos-test.csv`) tops out at `cust_00094`; the
     sequence starts at 1000 (`cust_01000` upward) so real signups never collide with it.
  3. **No email verification** for this MVP — unverified-email signup is fine.
- Tipping Point: social login (Google, etc.) or magic-link-only auth is a follow-up spec, not
  scope creep on this one.

---

**Sequencing note**: this branch (`product-a/auth-spec`) stacks on `product-a/cart-ui`, which
stacks on `product-a/catalog-browse` — whose own `SPEC.md` entry is still active and unverified
(see that branch / `apps/product-a/SESSION_STATE.md`). This file will conflict with that one at
merge time by design — whoever merges these PRs in order should move the catalog-browse spec to
`ARCHIVED_SPECS.md` once it's verified, before this one becomes the sole active spec.
