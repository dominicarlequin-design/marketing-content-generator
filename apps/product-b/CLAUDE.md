# Product B — Staff Inventory & Ops Dashboard

See root `CLAUDE.md` for team-wide rules, task lanes, and spec-driven development.
See root `docs/schema/riverside-books-schema.md` for the shared schema — link to it, don't
restate it here.

Owner: Philip Myers.

## What it does

Flags low/out-of-stock titles and tracks pending pre-orders for bookstore staff.

## Stack

Next.js (App Router), TypeScript (strict), Tailwind CSS, Supabase (Postgres) — per root
`CLAUDE.md` > Stack.

## Build / test / run

Not yet set up — commands go here once the project is scaffolded.

## Open items affecting this product

- `docs/schema/riverside-books-schema.md` open item 1: the Pending Preorders feature depends on
  `order_status` including a `preorder` value in Product A's actual data. Blocked on Jeffrey's
  confirmation.
