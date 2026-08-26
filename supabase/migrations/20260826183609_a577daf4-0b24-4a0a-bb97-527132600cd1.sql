-- ENUMS
create type public.app_role as enum ('customer','kasir','driver','admin');
create type public.order_status as enum ('menunggu','diproses','siap_antar','diambil_driver','diantar','selesai','ditolak','gagal_antar');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null default '',
  phone text,
  saldo bigint not null default 0,
  status_online boolean not null default false,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- staff role check helper
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('kasir','driver','admin'))
$$;

-- PROFILE POLICIES for staff/admin visibility
create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()));

-- new user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1)), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  icon text,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "admin manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  category_id uuid references public.categories(id) on delete set null,
  restaurant text not null default '',
  deskripsi text not null default '',
  harga bigint not null default 0,
  stok integer not null default 0,
  foto_url text,
  rating numeric(2,1) not null default 4.5,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "admin manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS (extend existing table)
alter table public.orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null,
  add column if not exists kasir_id uuid references auth.users(id) on delete set null,
  add column if not exists driver_id uuid references auth.users(id) on delete set null,
  add column if not exists status public.order_status not null default 'menunggu',
  add column if not exists metode_bayar text not null default 'wallet',
  add column if not exists catatan text,
  add column if not exists alasan text,
  add column if not exists diambil_kasir_at timestamptz,
  add column if not exists siap_antar_at timestamptz,
  add column if not exists diambil_driver_at timestamptz,
  add column if not exists selesai_at timestamptz;
alter table public.orders alter column customer_phone drop not null;
alter table public.orders alter column address drop not null;
alter table public.orders alter column customer_name drop not null;

grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
drop policy if exists "No direct client access to orders" on public.orders;
create policy "customer read own orders" on public.orders for select to authenticated using (customer_id = auth.uid());
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff(auth.uid()));

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  nama_produk text not null,
  harga bigint not null default 0,
  qty integer not null default 1,
  subtotal bigint not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "read own order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff(auth.uid())))
);

-- ORDER STATUS LOGS
create table public.order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status_dari public.order_status,
  status_ke public.order_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_role public.app_role,
  alasan text,
  created_at timestamptz not null default now()
);
grant select on public.order_status_logs to authenticated;
grant all on public.order_status_logs to service_role;
alter table public.order_status_logs enable row level security;
create policy "read order logs" on public.order_status_logs for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_staff(auth.uid())))
);

-- WALLET LOGS
create table public.wallet_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  jenis text not null,
  jumlah bigint not null,
  keterangan text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.wallet_logs to authenticated;
grant all on public.wallet_logs to service_role;
alter table public.wallet_logs enable row level security;
create policy "read own wallet logs" on public.wallet_logs for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- updated_at triggers
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

-- REALTIME
alter table public.orders replica identity full;
alter table public.products replica identity full;
alter table public.order_status_logs replica identity full;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.order_status_logs;

-- SEED categories & products
insert into public.categories (nama, icon) values
  ('Burger','burger'), ('Pizza','pizza'), ('Bakery','bakery'), ('Beverage','beverage'), ('Chicken','chicken'), ('Seafood','seafood');

insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Classic Truffle Burger', c.id, 'The Burger Joint', 'Wagyu beef patty, aged cheddar, truffle aioli, brioche bun.', 65000, 25,
 'https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=600&h=400&fit=crop&auto=format', 4.8 from public.categories c where c.nama='Burger';
insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Margherita Pizza', c.id, 'Napoli Corner', 'San Marzano tomato, fresh mozzarella, basil.', 78000, 18,
 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&auto=format', 4.7 from public.categories c where c.nama='Pizza';
insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Butter Croissant', c.id, 'Maison Bakery', 'Flaky French butter croissant baked fresh daily.', 25000, 40,
 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop&auto=format', 4.6 from public.categories c where c.nama='Bakery';
insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Iced Caramel Latte', c.id, 'Bean Studio', 'Double espresso, milk, caramel, ice.', 32000, 50,
 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&auto=format', 4.5 from public.categories c where c.nama='Beverage';
insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Crispy Fried Chicken', c.id, 'Ayam Kampus', 'Golden crispy chicken with sambal matah.', 45000, 30,
 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format', 4.9 from public.categories c where c.nama='Chicken';
insert into public.products (nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating)
select 'Grilled Salmon Bowl', c.id, 'Ocean Table', 'Grilled salmon, quinoa, avocado, citrus dressing.', 95000, 12,
 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&auto=format', 4.8 from public.categories c where c.nama='Seafood';