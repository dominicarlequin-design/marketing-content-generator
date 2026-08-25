-- Product A: add price to books, following the shared schema's price column
-- (docs/schema/riverside-books-schema.md, added 2026-08-24: decimal USD, per ISBN).
-- A new migration rather than editing 0001_books.sql — never rewrite an already-committed one.

alter table books add column if not exists price numeric(10, 2) not null default 0;
