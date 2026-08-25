-- Retrofit books to the shape docs/google-books-integration-plan.md specifies (team-confirmed
-- 2026-08-24, see DECISIONS.md on docs/google-books-live-data-plan): isbn/title/author/
-- cover_image_url/found/cached_at, so a getBook(isbn) cache-first Google Books lookup can slot
-- in later without another schema change. Live fetching is NOT built yet — Jeffrey chose to hold
-- off until the API-key question is resolved (unauthenticated Google Books calls return a 0
-- daily quota from at least one dev environment tried against this repo). This migration only
-- gets the shape ready.

alter table books rename column "ISBN" to isbn;
alter table books rename column book_title to title;
alter table books rename column author_name to author;

alter table books add column if not exists cover_image_url text;
alter table books add column if not exists found boolean not null default true;
alter table books add column if not exists cached_at timestamptz;

-- order_items."ISBN" follows books' rename for naming consistency across the schema. The FK
-- constraint itself updates automatically when the referenced column (books.isbn) is renamed
-- above; this just renames the referencing column to match.
alter table order_items rename column "ISBN" to isbn;

-- Re-created (not just left as-is) because it referenced the old column names directly.
create or replace function place_order(p_customer_id text, p_items jsonb)
returns text
language plpgsql
as $$
declare
  v_order_id text;
  v_item jsonb;
  v_isbn text;
  v_quantity integer;
  v_available integer;
  v_title text;
begin
  insert into orders (customer_id) values (p_customer_id) returning order_id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_isbn := v_item ->> 'isbn';
    v_quantity := (v_item ->> 'quantity')::integer;

    select stock_quantity, title into v_available, v_title
    from books
    where isbn = v_isbn
    for update;

    if v_available is null then
      raise exception 'No book found for ISBN %', v_isbn;
    end if;

    if v_available < v_quantity then
      raise exception 'Not enough stock for "%": % requested, % available', v_title, v_quantity, v_available;
    end if;

    update books set stock_quantity = stock_quantity - v_quantity where isbn = v_isbn;

    insert into order_items (order_id, isbn, quantity) values (v_order_id, v_isbn, v_quantity);
  end loop;

  return v_order_id;
end;
$$;
