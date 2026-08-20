# Decisions

Cross-team decision log — schema changes, interface agreements. A separate file from any single
product's `SESSION_STATE.md` so four people aren't merge-conflicting on one file for unrelated
build notes.

---

## 2026-08-20 — Team repo bootstrap

Set up this repo as the shared build workspace for Team 5's four-product Riverside Books build:
root `CLAUDE.md` (task lanes, spec-driven development, workflow rules), `SPEC.md` /
`ARCHIVED_SPECS.md`, the shared schema at `docs/schema/riverside-books-schema.md`, and
`apps/product-{a,b,c,d}/` scaffolding. Product D's already-built app (previously at repo root) was
relocated into `apps/product-d/` with git history preserved.

Three open schema items carried forward or discovered during this bootstrap — **all unresolved,
none silently picked one way or the other:**

1. **`order_status` enum conflict, Product A vs. schema** — schema says
   `Completed, pending, Shipped, preorder`; Product A's own docs may declare a different enum with
   no `preorder` value. Needs a yes/no from Jeffrey. See
   `docs/schema/riverside-books-schema.md` item 1.
2. **`orders` / `order_items` tables** — agreed in principle (two tables, so `order_status` lives
   in one place per order) but not yet written into the schema doc. Needs team confirmation before
   it's added. See `docs/schema/riverside-books-schema.md` item 2.
3. **`order_status` enum conflict, Product D vs. schema — discovered during this bootstrap.**
   Product D's committed `README.md` declares a third variant:
   `Pending, Ready for Pickup, Completed, Cancelled`. Matches neither the schema doc nor whatever
   Product A turns out to have. Product D has already shipped code against its own version, so
   this is live drift, not a hypothetical. Needs a team conversation to pick one canonical enum.
   See `docs/schema/riverside-books-schema.md` item 3.

**Nothing above has been resolved by this bootstrap.** All three are blockers for anyone
generating real data or building order-status logic until the team picks an answer.
