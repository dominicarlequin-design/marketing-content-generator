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

## 2026-08-24 — Correction: this environment can actually run the app

Every "not verified, no Node.js runtime" note above was written believing `npm`/`node` were
unavailable. They are, but `bun` (a JS runtime, already on `PATH`) is installed and runs this
Next.js app fine: `bun install`, `bun run build`, and `bun run dev` all work. Verified for real
in this session, in an actual browser (via gstack's `/browse`):

- `bun run build` on the full stack (scaffold + catalog-browse + cart-ui + auth-spec +
  order-placement) compiles clean — TypeScript strict, zero errors, all 5 routes
  (`/`, `/cart`, `/login`, `/signup`) generate.
- Loaded all four pages in a real headless browser — zero console errors on any of them.
- **Found and traced a real click-automation bug** (not an app bug): clicking a button
  immediately after `snapshot` right after page navigation sometimes resolves to the wrong
  element (browser-automation ref/hydration race). Adding `wait --networkidle` between
  navigation and the next snapshot fixed it. Confirmed the underlying cart logic itself is
  correct: clicking "Add to cart" on the same book twice correctly increments quantity to 2
  (verified via `localStorage` directly), not a duplicate line item.
- Added a **sample-data fallback** to `lib/books.ts` (`SAMPLE_BOOKS`, 8 real titles pulled from
  `docs/schema/riverside-books-integration-chaos-test.csv`, not invented) so the catalog page
  shows something real without a live Supabase project — `getBooks()` now returns
  `{ books, source: "supabase" | "sample" }` instead of the old `configured` boolean.
  `app/page.tsx` updated to match; verified live with a screenshot showing all 8 books, correct
  out-of-stock disabling on one.
- Verified the signup form's "Supabase isn't configured yet." error path renders correctly with
  no crash and no console error when Supabase env vars aren't set.

**Still not verified**: anything that requires an actual Supabase project (real signup/login,
real catalog rows from the `books` table, the `place_order` RPC below) — there is no live
Supabase project connected in this environment, sample-data/error-path fallbacks aside. That
needs either a real project's URL + anon key, or someone running the migrations and testing by
hand.

## 2026-08-24 — Order placement

Built per `SPEC.md` on `product-a/order-placement`, stacked on `product-a/auth-spec`:

- `supabase/migrations/0003_orders.sql` — `orders`/`order_items` tables (per `DECISIONS.md`'s
  working assumption) plus `place_order(p_customer_id, p_items)`, a Postgres function doing the
  whole checkout atomically: create the order, lock + check + decrement `stock_quantity` per
  item, insert `order_items`, raising (rolling back everything) if any item is short on stock.
  `order_id` generated the same way as `customer_id` — a sequence, `ord_01000` upward.
- `lib/orders.ts` — `placeOrder(customerId, items)` wrapping the RPC call.
- `lib/cart.ts` — added `clearCart()`.
- `app/cart/page.tsx` — "Place order" button when logged in; "Log in to place an order" link
  when not (the route-guarding auth's spec deferred to here); order confirmation state showing
  the new `order_id`, cart cleared on success.

**Deliberately not built**: loyalty points. `reward_points` exists in the shared schema but
there's no defined earn rate anywhere (per item? per dollar — which still needs the missing
`price` column?) and guessing one would be exactly the "invent a number that should have been
computed" mistake root `CLAUDE.md`'s Bounded AI rule warns against. Needs a decision from
Jeffrey before it's built.

**Verified live** (real browser, `bun run dev`): the logged-out `/cart` correctly shows "Log in
to place an order" instead of a broken button, zero console errors, build compiles clean.
**Not verified**: the actual `place_order` RPC — no live Supabase project to run it against, so
the insufficient-stock rollback and the real order/stock-decrement path are unverified beyond
the SQL logic itself.

Product A now has, top to bottom: browse (sample or live data) → add to cart → sign up / log in
→ place order. What's left for a fuller "finished" product: wiring a live Supabase project (real
data, real accounts, real orders — I don't have credentials to create one myself), a nav
link for login/logout state, and loyalty points once an earn rate is decided.

## 2026-08-24 — Nav login/logout link

Built on `product-a/nav-auth-links`, stacked on `product-a/order-placement`:

- `components/AuthNav.tsx` — client component, shows "Log in" / "Sign up" links when signed
  out, or the current `customer_id` + a "Log out" button when signed in.
- `app/layout.tsx` — added a shared header (site name, "Cart" link, `AuthNav`) so it's on every
  page instead of just being reachable by typing `/login` or `/signup`.
- `app/page.tsx` — removed its own "Riverside Books" heading and "View cart" link, now redundant
  with the shared header.

**Verified live** (real browser, `bun run dev`, fresh port 3000 since 3001 was still held by the
prior session's server): build compiles clean, header renders correctly on both `/` and `/cart`
with "Cart / Log in / Sign up" all present, zero console errors on either page.
**Not verified**: the logged-in state (customer_id + "Log out") — needs a real Supabase session,
which needs a live project.

This was the one item from the three offered ("keep going") that didn't need anything from
Jeffrey — the other two (live Supabase project, loyalty earn rate) are still waiting on him.
