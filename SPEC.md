# [SPEC] Product A — catalog browse page

- Objective: Give customers a read-only page listing books available at Riverside Books, backed
  by Supabase, so the ordering flow (a later spec) has something to order from.
- Approach: A `books` table in Supabase with columns drawn straight from the shared schema
  (`docs/schema/riverside-books-schema.md`) — no invented columns. A typed data-access function
  fetches all rows server-side (Next.js Server Component) and renders a simple list. No client
  state, no search/filter yet — smallest reviewable slice per Jeffrey's scope call. Alternative
  considered: client-side fetch via the Supabase JS client in a `"use client"` component — rejected
  for this first slice since a server component avoids shipping the anon key's query logic to the
  browser bundle and needs no loading spinner.
- Inputs/Outputs:
  - Input: rows in a Supabase `books` table — `ISBN` (text, PK), `book_title` (text),
    `author_name` (text), `stock_quantity` (integer).
  - Output: `getBooks(): Promise<Book[]>` in `lib/books.ts`; rendered as a list on `/` (title,
    author, in-stock/out-of-stock based on `stock_quantity`).
- Verification: `npm run build` succeeds (TypeScript strict, no errors); `npm run dev`, visit
  `/` — with `.env.local` unset, the page renders a clear "not configured" message instead of
  crashing the whole route; with a Supabase project configured and a `books` table seeded (e.g.
  from `docs/schema/riverside-books-integration-chaos-test.csv`), the page lists real rows.
  **Not run in this session — no Node.js runtime available in the build environment.** Jeffrey (or
  whoever picks this PR up) must run this before merging.
- Files: `apps/product-a/lib/books.ts`, `apps/product-a/types/book.ts`, `apps/product-a/app/page.tsx`
  (replacing the scaffold placeholder), `apps/product-a/lib/supabase.ts` (client now returns `null`
  on missing env vars instead of throwing, so the page can render the not-configured message
  instead of crashing), `apps/product-a/SESSION_STATE.md`.
- Edge Cases: Supabase env vars unset (currently throws at import — this spec adds a guarded,
  user-visible message instead of an unhandled crash); empty `books` table (empty state, not an
  error); `stock_quantity` of 0 (shown as out-of-stock, not hidden).
- Open Questions: none blocking — schema columns used here are already confirmed, no
  `orders`/`order_items` dependency for a read-only catalog view.
- Tipping Point: none — this is already the smallest reviewable slice.
