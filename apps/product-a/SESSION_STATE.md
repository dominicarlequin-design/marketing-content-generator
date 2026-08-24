## 2026-08-24 — Scaffold

Scaffolded the Next.js app (App Router, TypeScript strict, Tailwind v4, Supabase client) on
`product-a/scaffold-nextjs-app`. Placeholder home page only — no catalog, ordering, or loyalty
UI yet.

**Not verified locally**: no Node.js runtime was available in the environment this scaffold was
built in, so `npm install` / `npm run dev` / `npm run build` have not been run. The config files
mirror Product D's working setup exactly (same Next/React/Tailwind versions), but run these
before trusting the scaffold:

```
cd apps/product-a
npm install
npm run dev
```

No Supabase project is wired up yet — `.env.example` lists the two env vars needed
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`); without them `lib/supabase.ts`
throws on import.

## 2026-08-24 — Catalog browse

Built per `SPEC.md` (still active — not archived, see below) on `product-a/catalog-browse`,
stacked on the scaffold branch:

- `lib/supabase.ts` — `getSupabaseClient()` now returns `null` when env vars are missing instead
  of throwing, so the route can render a message instead of crashing.
- `lib/books.ts` — `getBooks()` queries a Supabase `books` table
  (`ISBN, book_title, author_name, stock_quantity`, straight off the shared schema) and returns
  `{ books, configured }`.
- `types/book.ts` — `Book` type.
- `app/page.tsx` — server component rendering the list, with states for "not configured", "empty
  catalog", and populated.

**Not verified**: same no-Node.js constraint as the scaffold — `npm run build` / `npm run dev`
have not been run, and there is no live Supabase project with a `books` table to test the
populated-list path against. There is also no seed script yet for a `books` table — someone
needs to create the table in Supabase and load rows (e.g. from
`docs/schema/riverside-books-integration-chaos-test.csv`'s ISBN/book_title/author_name/
stock_quantity columns) before the populated path can be checked. `SPEC.md` stays active
(not moved to `ARCHIVED_SPECS.md`) until a human runs the Verification steps.

Next up: order the ordering-flow spec once catalog browse is verified — building order logic
before that would touch the `orders`/`order_items` working assumption from `DECISIONS.md`
2026-08-24, which is genuinely INVARIANT (money/state, not just display) and needs its own
spec + nod first.

## 2026-08-24 — Cart UI

Client-side "add to cart" on `product-a/cart-ui`, stacked on `product-a/catalog-browse`. OBSERVABLE
lane — no schema writes, no money math, no spec required:

- `lib/cart.ts` — cart read/write against `localStorage` (key `riverside-books-cart`). Not
  persisted anywhere server-side; this is a browser-only cart, not an order.
- `components/AddToCartButton.tsx` — per-book button on the catalog page, disabled when
  `stockQuantity` is 0.
- `app/cart/page.tsx` — view/edit quantities, remove items. Explicitly does **not** show a dollar
  total: the shared schema has no `price` column, so nothing is fabricated. Flagged in the page
  copy itself.
- `app/page.tsx` — wired up the button per row and added a "View cart" link.

**Data-model gap surfaced by this work**: there is no `price` column anywhere in
`docs/schema/riverside-books-schema.md` or the sample CSV. Checkout/order-total math is
impossible without one. This is a schema-change decision (root `CLAUDE.md` — needs a proposal +
nod from each product owner), not something to invent here. Worth raising with the team before
the order-placement spec below is written, since it may end up needing a price field too.

**Not verified**: same no-Node.js constraint — the localStorage read/write logic, the
add/remove/quantity flows, and the empty-cart state have not been run in a browser in this
session.

Next up: order-placement spec (writes `orders`/`order_items`, decrements `stock_quantity`) — this
is genuinely INVARIANT (silent-wrong risk: double-counted stock, orphaned order rows) and per
root `CLAUDE.md` needs a written `SPEC.md` and a human nod before any code, not just a scope
answer. Draft proposed to Jeffrey on 2026-08-24 pending approval.

## 2026-08-24 — Minimal customer auth

Built per `SPEC.md` on `product-a/auth-spec`, stacked on `product-a/cart-ui`, after Jeffrey
resolved the three open questions (customers table is Product-A-internal; customer_id is
sequential, matching the synthetic dataset's `cust_XXXXX` style; no email verification for this
MVP):

- `apps/product-a/supabase/migrations/0001_books.sql` — the `books` table's create statement,
  finally checked in (it existed only as instructions in this file before now).
- `apps/product-a/supabase/migrations/0002_customers.sql` — `customers` table + a
  `customer_id_seq` Postgres sequence starting at 1000, so generated IDs (`cust_01000` upward)
  never collide with the synthetic dataset, which tops out at `cust_00094`.
- `lib/auth.ts` — `signUp`, `signIn`, `signOut`, `getCurrentCustomerId()`, plus an internal
  `ensureCustomerRow()` used by both signup and login (covers the case where the `customers`
  insert failed after `auth.signUp()` succeeded).
- `app/signup/page.tsx`, `app/login/page.tsx` — plain email/password forms, client-side calls
  into `lib/auth.ts`, redirect to `/` on success.

**Not wired up yet**: no "Log in" / "Sign out" link anywhere in the UI (only reachable by typing
`/signup` or `/login`), and no route guarding — `/cart` works whether or not you're logged in.
Both are the order-placement spec's job, not this one's, per this spec's stated Edge Cases.

**Not verified**: same no-Node.js constraint as everything else in this session, plus these two
migrations have never been run against a real Supabase project. Before trusting any of this:

```
cd apps/product-a
# in the Supabase SQL editor, run supabase/migrations/0001_books.sql then 0002_customers.sql
# enable Auth (email provider) in the Supabase project if not already on
npm install && npm run dev
```

Then walk the spec's Verification steps by hand: sign up, confirm a `customers` row appears,
log out/in, try a duplicate email.

Next up: with a real `customer_id` now obtainable, the order-placement spec (writes
`orders`/`order_items`, decrements `stock_quantity`) is unblocked on the identity side — still
needs its own `SPEC.md` and a human nod before code, being INVARIANT.
