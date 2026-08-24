# Product A — Customer Ordering & Loyalty App

See root `CLAUDE.md` for team-wide rules, task lanes, and spec-driven development.
See root `docs/schema/riverside-books-schema.md` for the shared schema — link to it, don't
restate it here.

Owner: Jeffrey de la Cruz.

## Stack

Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, React 19, Supabase
(`@supabase/supabase-js`) — matches root `CLAUDE.md` > Stack.

## Build / test / run

- `npm install`
- Copy `.env.example` to `.env.local` and fill in a Supabase project's URL/anon key
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Open items affecting this product

- `docs/schema/riverside-books-schema.md` open item 1: does this product's `order_status` enum
  include `preorder`? Needs a yes/no before Product B's Pending Preorders feature can be trusted.
