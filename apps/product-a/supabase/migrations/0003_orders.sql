-- Product A: orders / order_items + the place_order() RPC — see SPEC.md "order placement".
-- orders/order_items shape is DECISIONS.md's 2026-08-24 working assumption, not yet in the
-- canonical shared schema (needs full-team confirmation before that happens).
-- order_id follows the same generated-sequence pattern as customer_id (see 0002_customers.sql).

create sequence if not exists order_id_seq start 1000;

create table if not exists orders (
  order_id text primary key
    default ('ord_' || lpad(nextval('order_id_seq')::text, 5, '0')),
  customer_id text not null references customers (customer_id),
  order_status text not null default 'pending'
);

create table if not exists order_items (
  order_id text not null references orders (order_id) on delete cascade,
  "ISBN" text not null references books ("ISBN"),
  quantity integer not null check (quantity > 0),
  primary key (order_id, "ISBN")
);

-- Does everything in one transaction: create the order, lock + check + decrement stock per
-- item, insert order_items. Raises (rolling back the whole thing — no order, no decrement) if
-- any item doesn't have enough stock, so a failed order never leaves partial state.
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

    select stock_quantity, book_title into v_available, v_title
    from books
    where "ISBN" = v_isbn
    for update;

    if v_available is null then
      raise exception 'No book found for ISBN %', v_isbn;
    end if;

    if v_available < v_quantity then
      raise exception 'Not enough stock for "%": % requested, % available', v_title, v_quantity, v_available;
    end if;

    update books set stock_quantity = stock_quantity - v_quantity where "ISBN" = v_isbn;

    insert into order_items (order_id, "ISBN", quantity) values (v_order_id, v_isbn, v_quantity);
  end loop;

  return v_order_id;
end;
$$;
