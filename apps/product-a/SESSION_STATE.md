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
