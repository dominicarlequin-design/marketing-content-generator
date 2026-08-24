# [SPEC] Product A — minimal customer auth

- Objective: Let a customer sign up and log in, producing a real `customer_id` that
  order-placement (a later spec) can attach to an `orders` row — replacing the choice we already
  ruled out of guessing or hardcoding one.
- Approach: Use Supabase Auth (email + password) for credential handling — it's already in the
  confirmed stack and already does password hashing/session management correctly; hand-rolling
  that is exactly the kind of security-sensitive work this codebase shouldn't take on itself.
  On successful sign-up, insert a row into a new `customers` table (`customer_id` text PK in the
  shared `cust_XXXXX` format, `auth_user_id` uuid referencing Supabase's `auth.users.id`,
  `signup_date` date) from the sign-up Server Action, right after `supabase.auth.signUp()`
  succeeds. Login checks for a missing `customers` row and creates one if absent, so a
  partial failure between the two inserts (network blip) doesn't permanently strand a user.
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
- Files: `apps/product-a/lib/auth.ts` (sign-up/sign-in/sign-out wrappers + current-session
  helper), `apps/product-a/lib/customers.ts` (ensure-customer-row logic, shared by signup and
  login), `apps/product-a/app/signup/page.tsx`, `apps/product-a/app/login/page.tsx`,
  `apps/product-a/SESSION_STATE.md`.
- Edge Cases: signup succeeds in Supabase Auth but the `customers` insert fails — handled by the
  login-time backfill described above, not a silent stuck account. Duplicate email — surface
  Supabase Auth's own error, don't write a second `customers` row. Logged-out user hitting
  `/cart` — explicitly out of scope for this spec; route guarding is the order-placement spec's
  job, not this one's.
- Open Questions (need an answer before I write code):
  1. Does the new `customers` table count as a schema change needing the full team's nod (root
     `CLAUDE.md`: "schema changes are a team decision"), or is it Product-A-internal plumbing
     since `customer_id` itself already exists in the shared schema and no other product's column
     changes meaning? I'd treat it as internal and proceed, but this is exactly the kind of call
     the rules say not to make unilaterally.
  2. `customer_id` format — the shared schema's example is `cust_00042` (reads as sequential). Is
     a random suffix (`cust_` + a short random string, with a uniqueness constraint so collisions
     fail loudly instead of silently overwriting) acceptable, or does it need to actually be
     sequential (a Postgres sequence)?
  3. Does this MVP need Supabase's email-verification step turned on, or is unverified-email
     signup fine for now?
- Tipping Point: social login (Google, etc.) or magic-link-only auth is a follow-up spec, not
  scope creep on this one.

---

**Sequencing note**: this branch (`product-a/auth-spec`) stacks on `product-a/cart-ui`, which
stacks on `product-a/catalog-browse` — whose own `SPEC.md` entry is still active and unverified
(see that branch / `apps/product-a/SESSION_STATE.md`). This file will conflict with that one at
merge time by design — whoever merges these PRs in order should move the catalog-browse spec to
`ARCHIVED_SPECS.md` once it's verified, before this one becomes the sole active spec.
