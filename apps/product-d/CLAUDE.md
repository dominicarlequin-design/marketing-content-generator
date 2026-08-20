# Product D — Marketing Content Generator

See root `CLAUDE.md` for team-wide rules, task lanes, and spec-driven development.
See root `docs/schema/riverside-books-schema.md` for the shared schema — link to it, don't
restate it here.

Owner: Dominic Arlequin.

## What it does

Generates marketing content: email campaigns, social posts, and event promos for the bookstore's
customers. See `README.md` in this folder for the product's role in the suite and its prior
(pre-relocation) data-contract notes.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, React 19.

## Build / test / run

- `npm install`
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Notes

- `AGENTS.md` in this folder is written and re-added by `next dev` (Next.js agent-rules block) —
  don't strip it from diffs; committing it with other changes keeps the tree clean.
- `generate_post.py` and `marketing_content_generator_synthetic_data.csv` are this product's
  content-generation script and synthetic fixture data.

## Open items affecting this product

- `docs/schema/riverside-books-schema.md` open item 3: this product's own `README.md` declares an
  `order_status` enum (`Pending, Ready for Pickup, Completed, Cancelled`) that matches neither the
  shared schema nor (possibly) Product A's. Needs a team decision on one canonical enum, then a
  follow-up change here once it's picked.
