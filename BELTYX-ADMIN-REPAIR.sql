-- BELTYX ADMIN REPAIR: run in Supabase SQL Editor after opening the BELTYX project.
-- Safe to re-run. Does not delete products, categories, reviews, orders, or uploaded files.
begin;

-- Ensure future abc_products IDs start at/above 1,000,000 so they do not overlap
-- the legacy products table's ID range (the admin UI and storefront rely on this).
do $$
declare seq_name text; max_id bigint;
begin
  seq_name := pg_get_serial_sequence('public.abc_products','id');
  if seq_name is not null then
    select greatest(coalesce(max(id),999999),999999) into max_id from public.abc_products;
    perform setval(seq_name::regclass,max_id,true);
  end if;
end $$;

-- Required API privileges; row-level security policies still control which rows/actions are allowed.
grant usage on schema public to anon, authenticated;
grant select on public.products, public.abc_products, public.product_media, public.abc_product_media, public.store_settings, public.reviews to anon, authenticated;
grant insert on public.reviews, public.orders, public.abc_product_activity to anon, authenticated;
grant select, insert, update, delete on public.products, public.abc_products, public.product_media, public.abc_product_media, public.store_settings, public.reviews, public.orders, public.abc_product_activity to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Ensure RLS remains enabled on every table used by the storefront/admin.
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.abc_products enable row level security;
alter table public.product_media enable row level security;
alter table public.abc_product_media enable row level security;
alter table public.store_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.abc_product_activity enable row level security;

commit;
