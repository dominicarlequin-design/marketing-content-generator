-- Product A: customers table (auth bridge) — see SPEC.md "minimal customer auth".
-- Bridges Supabase Auth's auth.users to the shared schema's customer_id format (cust_XXXXX).
-- Sequence starts at 1000 so generated IDs never collide with the synthetic dataset's existing
-- customer_ids (docs/schema/riverside-books-integration-chaos-test.csv tops out at cust_00094).

create sequence if not exists customer_id_seq start 1000;

create table if not exists customers (
  customer_id text primary key
    default ('cust_' || lpad(nextval('customer_id_seq')::text, 5, '0')),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  signup_date date not null default current_date
);
