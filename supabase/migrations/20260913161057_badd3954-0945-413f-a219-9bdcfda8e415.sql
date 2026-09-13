-- ===== Enum additions =====
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'hold';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'dibayar';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'void';

-- ===== Outlets =====
CREATE TABLE IF NOT EXISTS public.outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  alamat text,
  phone text,
  pajak_persen numeric NOT NULL DEFAULT 0,
  service_persen numeric NOT NULL DEFAULT 0,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outlets TO authenticated;
GRANT ALL ON public.outlets TO service_role;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full outlets" ON public.outlets FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER outlets_updated_at BEFORE UPDATE ON public.outlets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.outlets (nama, alamat) VALUES ('Outlet Utama', '-');

-- ===== Operators (PIN untuk audit) =====
CREATE TABLE IF NOT EXISTS public.operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  nama text NOT NULL,
  pin_hash text NOT NULL,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operators TO authenticated;
GRANT ALL ON public.operators TO service_role;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full operators" ON public.operators FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER operators_updated_at BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Shifts =====
CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'open',
  kas_awal bigint NOT NULL DEFAULT 0,
  kas_akhir bigint,
  kas_sistem bigint,
  selisih bigint,
  total_transaksi integer NOT NULL DEFAULT 0,
  total_penjualan bigint NOT NULL DEFAULT 0,
  catatan text,
  dibuka_at timestamptz NOT NULL DEFAULT now(),
  ditutup_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full shifts" ON public.shifts FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ===== Tables (meja) =====
CREATE TABLE IF NOT EXISTS public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  nomor text NOT NULL,
  kapasitas integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'kosong',
  qr_code text,
  current_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tables TO authenticated;
GRANT SELECT ON public.tables TO anon;
GRANT ALL ON public.tables TO service_role;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full tables" ON public.tables FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "anon read tables" ON public.tables FOR SELECT TO anon USING (true);

-- ===== Categories: station =====
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS station text NOT NULL DEFAULT 'kitchen';
UPDATE public.categories SET station = 'bar' WHERE lower(nama) IN ('beverage','minuman','drink','drinks');

-- ===== Product modifiers =====
CREATE TABLE IF NOT EXISTS public.product_modifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  grup text NOT NULL DEFAULT 'Extra',
  nama text NOT NULL,
  harga bigint NOT NULL DEFAULT 0,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_modifiers TO authenticated;
GRANT SELECT ON public.product_modifiers TO anon;
GRANT ALL ON public.product_modifiers TO service_role;
ALTER TABLE public.product_modifiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full product_modifiers" ON public.product_modifiers FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "public read product_modifiers" ON public.product_modifiers FOR SELECT TO anon USING (true);

-- ===== Orders: POS columns =====
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'dine_in',
  ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS held boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_charge bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS change_amount bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS void_reason text,
  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS kds_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'pos',
  ADD COLUMN IF NOT EXISTS crm_customer_id uuid;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS modifiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS station text NOT NULL DEFAULT 'kitchen';

-- ===== Payments =====
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  metode text NOT NULL,
  jumlah bigint NOT NULL DEFAULT 0,
  diterima bigint NOT NULL DEFAULT 0,
  kembalian bigint NOT NULL DEFAULT 0,
  referensi text,
  operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full payments" ON public.payments FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ===== KDS tickets =====
CREATE TABLE IF NOT EXISTS public.kds_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  station text NOT NULL DEFAULT 'kitchen',
  status text NOT NULL DEFAULT 'new',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kds_tickets TO authenticated;
GRANT ALL ON public.kds_tickets TO service_role;
ALTER TABLE public.kds_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full kds_tickets" ON public.kds_tickets FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ===== Audit logs =====
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  aksi text NOT NULL,
  entitas text NOT NULL,
  entitas_id text,
  sebelum jsonb,
  sesudah jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read audit" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth insert audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ===== Notifications =====
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  jenis text NOT NULL,
  judul text NOT NULL,
  pesan text,
  dibaca boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ===== Customers (CRM) =====
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  phone text,
  email text,
  poin integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'regular',
  total_belanja bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full customers" ON public.customers FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Inventory =====
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  phone text,
  alamat text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full suppliers" ON public.suppliers FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  nama text NOT NULL,
  satuan text NOT NULL DEFAULT 'pcs',
  stok numeric NOT NULL DEFAULT 0,
  stok_minimum numeric NOT NULL DEFAULT 0,
  harga_beli bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full ingredients" ON public.ingredients FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE TRIGGER ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  jumlah numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, ingredient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full recipes" ON public.recipes FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  jenis text NOT NULL,
  jumlah numeric NOT NULL,
  keterangan text,
  operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full stock_movements" ON public.stock_movements FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  outlet_id uuid REFERENCES public.outlets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total bigint NOT NULL DEFAULT 0,
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full purchase_orders" ON public.purchase_orders FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ===== Single account type: open existing tables to any signed-in user =====
DROP POLICY IF EXISTS "customer read own orders" ON public.orders;
DROP POLICY IF EXISTS "staff read orders" ON public.orders;
CREATE POLICY "auth full orders" ON public.orders FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;

DROP POLICY IF EXISTS "read own order items" ON public.order_items;
CREATE POLICY "auth full order_items" ON public.order_items FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;

DROP POLICY IF EXISTS "read order logs" ON public.order_status_logs;
CREATE POLICY "auth full order_status_logs" ON public.order_status_logs FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_status_logs TO authenticated;

DROP POLICY IF EXISTS "admin manage products" ON public.products;
CREATE POLICY "auth manage products" ON public.products FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

DROP POLICY IF EXISTS "admin manage categories" ON public.categories;
CREATE POLICY "auth manage categories" ON public.categories FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;

DROP POLICY IF EXISTS "read own wallet logs" ON public.wallet_logs;
CREATE POLICY "auth full wallet_logs" ON public.wallet_logs FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_logs TO authenticated;

DROP POLICY IF EXISTS "staff read profiles" ON public.profiles;
CREATE POLICY "auth read profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- ===== Atomic stock adjust =====
CREATE OR REPLACE FUNCTION public.adjust_product_stock(_product_id uuid, _delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_stok integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.products SET stok = GREATEST(0, stok + _delta) WHERE id = _product_id RETURNING stok INTO new_stok;
  RETURN new_stok;
END;
$$;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(uuid, integer) TO authenticated;

-- ===== Realtime =====
ALTER TABLE public.outlets REPLICA IDENTITY FULL;
ALTER TABLE public.operators REPLICA IDENTITY FULL;
ALTER TABLE public.shifts REPLICA IDENTITY FULL;
ALTER TABLE public.tables REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.kds_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.ingredients REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outlets, public.operators, public.shifts, public.tables, public.payments, public.kds_tickets, public.notifications, public.ingredients, public.categories, public.audit_logs;

CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shift ON public.orders (shift_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_kds_status ON public.kds_tickets (status);