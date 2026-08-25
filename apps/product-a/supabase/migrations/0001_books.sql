-- Product A: books table (catalog) — see apps/product-a/SESSION_STATE.md "Catalog browse".
-- Columns match the shared schema exactly (docs/schema/riverside-books-schema.md); no invented
-- columns. "ISBN" is quoted so Postgres keeps the exact case lib/books.ts queries against.

create table if not exists books (
  "ISBN" text primary key,
  book_title text not null,
  author_name text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0)
);
