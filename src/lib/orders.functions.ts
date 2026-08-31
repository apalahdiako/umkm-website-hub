import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "customer" | "kasir" | "driver" | "admin";
type Status =
  | "menunggu"
  | "diproses"
  | "siap_antar"
  | "diambil_driver"
  | "diantar"
  | "selesai"
  | "ditolak"
  | "gagal_antar";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function hasRole(
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> },
  userId: string,
  role: Role
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
  return data === true;
}

async function requireRole(
  supabase: Parameters<typeof hasRole>[0],
  userId: string,
  roles: Role[]
) {
  for (const r of roles) {
    if (await hasRole(supabase, userId, r)) return r;
  }
  throw new Error("Akses ditolak: role tidak sesuai");
}

async function logStatus(
  db: Awaited<ReturnType<typeof admin>>,
  orderId: string,
  from: Status | null,
  to: Status,
  by: string,
  role: Role,
  alasan?: string
) {
  await db.from("order_status_logs").insert({
    order_id: orderId,
    status_dari: from,
    status_ke: to,
    changed_by: by,
    changed_by_role: role,
    alasan: alasan ?? null,
  });
}

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      items: { product_id: string; qty: number }[];
      address: string;
      catatan?: string;
    }) => {
      if (!Array.isArray(input.items) || input.items.length === 0)
        throw new Error("Keranjang kosong");
      if (!input.address || input.address.trim().length < 5)
        throw new Error("Alamat pengantaran wajib diisi");
      return input;
    }
  )
  .handler(async ({ data, context }) => {
    const db = await admin();
    const userId = context.userId;

    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await db
      .from("products")
      .select("id, nama, harga, stok, aktif")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    let subtotal = 0;
    const rows = data.items.map((it) => {
      const p = products?.find((x) => x.id === it.product_id);
      if (!p || !p.aktif) throw new Error("Produk tidak tersedia");
      const qty = Math.max(1, Math.floor(it.qty));
      if (p.stok < qty) throw new Error(`Stok ${p.nama} tidak cukup (sisa ${p.stok})`);
      const sub = Number(p.harga) * qty;
      subtotal += sub;
      return {
        product_id: p.id,
        nama_produk: p.nama,
        harga: Number(p.harga),
        qty,
        subtotal: sub,
      };
    });

    const { data: profile } = await db
      .from("profiles")
      .select("nama, phone, saldo")
      .eq("id", userId)
      .maybeSingle();

    if ((profile?.saldo ?? 0) < subtotal)
      throw new Error("Saldo wallet tidak cukup. Silakan top up dulu.");

    const orderCode = `DLV-${Date.now().toString(36).toUpperCase()}`;
    const { data: order, error: oErr } = await db
      .from("orders")
      .insert({
        order_code: orderCode,
        customer_id: userId,
        customer_name: profile?.nama ?? "",
        customer_phone: profile?.phone ?? null,
        address: data.address,
        catatan: data.catatan ?? null,
        status: "menunggu",
        metode_bayar: "wallet",
        items: rows,
        subtotal,
        total: subtotal,
        shipping_cost: 0,
      })
      .select("id, order_code")
      .single();
    if (oErr) throw new Error(oErr.message);

    await db
      .from("order_items")
      .insert(rows.map((r) => ({ ...r, order_id: order.id })));
    await logStatus(db, order.id, null, "menunggu", userId, "customer");

    return { id: order.id as string, order_code: order.order_code as string };
  });

export const topUpWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number }) => {
    if (!Number.isFinite(input.amount) || input.amount < 10000 || input.amount > 10000000)
      throw new Error("Nominal top up antara Rp10.000 - Rp10.000.000");
    return { amount: Math.floor(input.amount) };
  })
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: profile } = await db
      .from("profiles")
      .select("saldo")
      .eq("id", context.userId)
      .maybeSingle();
    const saldo = (profile?.saldo ?? 0) + data.amount;
    const { error } = await db
      .from("profiles")
      .update({ saldo })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    await db.from("wallet_logs").insert({
      user_id: context.userId,
      jenis: "topup",
      jumlah: data.amount,
      keterangan: "Top up saldo wallet",
    });
    return { saldo };
  });

async function getOrder(db: Awaited<ReturnType<typeof admin>>, id: string) {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pesanan tidak ditemukan");
  return data;
}

/** Kasir menerima pesanan: potong saldo customer + kurangi stok */
export const kasirAcceptOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => input)
  .handler(async ({ data, context }) => {
    const role = await requireRole(context.supabase, context.userId, ["kasir", "admin"]);
    const db = await admin();
    const order = await getOrder(db, data.orderId);
    if (order.status !== "menunggu") throw new Error("Pesanan sudah diproses");

    const { data: profile } = await db
      .from("profiles")
      .select("saldo")
      .eq("id", order.customer_id)
      .maybeSingle();
    if ((profile?.saldo ?? 0) < order.total)
      throw new Error("Saldo customer tidak cukup, tolak pesanan ini");

    await db
      .from("profiles")
      .update({ saldo: (profile?.saldo ?? 0) - order.total })
      .eq("id", order.customer_id);
    await db.from("wallet_logs").insert({
      user_id: order.customer_id,
      jenis: "pembayaran",
      jumlah: -order.total,
      order_id: order.id,
      keterangan: `Pembayaran pesanan ${order.order_code}`,
    });

    const { data: items } = await db
      .from("order_items")
      .select("product_id, qty")
      .eq("order_id", order.id);
    for (const it of items ?? []) {
      if (!it.product_id) continue;
      const { data: p } = await db
        .from("products")
        .select("stok")
        .eq("id", it.product_id)
        .maybeSingle();
      await db
        .from("products")
        .update({ stok: Math.max(0, (p?.stok ?? 0) - it.qty) })
        .eq("id", it.product_id);
    }

    const { error } = await db
      .from("orders")
      .update({
        status: "diproses",
        kasir_id: context.userId,
        diambil_kasir_at: new Date().toISOString(),
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    if (error) throw new Error(error.message);
    await logStatus(db, order.id, "menunggu", "diproses", context.userId, role);
    return { ok: true };
  });

export const kasirRejectOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; alasan: string }) => {
    if (!input.alasan?.trim()) throw new Error("Alasan penolakan wajib diisi");
    return input;
  })
  .handler(async ({ data, context }) => {
    const role = await requireRole(context.supabase, context.userId, ["kasir", "admin"]);
    const db = await admin();
    const order = await getOrder(db, data.orderId);
    if (order.status !== "menunggu") throw new Error("Pesanan sudah diproses");
    await db
      .from("orders")
      .update({ status: "ditolak", alasan: data.alasan, kasir_id: context.userId })
      .eq("id", order.id);
    await logStatus(db, order.id, "menunggu", "ditolak", context.userId, role, data.alasan);
    return { ok: true };
  });

export const kasirReadyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => input)
  .handler(async ({ data, context }) => {
    const role = await requireRole(context.supabase, context.userId, ["kasir", "admin"]);
    const db = await admin();
    const order = await getOrder(db, data.orderId);
    if (order.status !== "diproses") throw new Error("Status pesanan tidak valid");
    await db
      .from("orders")
      .update({ status: "siap_antar", siap_antar_at: new Date().toISOString() })
      .eq("id", order.id);
    await logStatus(db, order.id, "diproses", "siap_antar", context.userId, role);
    return { ok: true };
  });

export const driverTakeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => input)
  .handler(async ({ data, context }) => {
    const role = await requireRole(context.supabase, context.userId, ["driver", "admin"]);
    const db = await admin();
    const order = await getOrder(db, data.orderId);
    if (order.status !== "siap_antar" || order.driver_id)
      throw new Error("Pesanan sudah diambil driver lain");
    await db
      .from("orders")
      .update({
        status: "diambil_driver",
        driver_id: context.userId,
        diambil_driver_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "siap_antar");
    await logStatus(db, order.id, "siap_antar", "diambil_driver", context.userId, role);
    return { ok: true };
  });

export const driverUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; to: Status; alasan?: string }) => {
    if (!["diantar", "selesai", "gagal_antar"].includes(input.to))
      throw new Error("Status tidak valid");
    return input;
  })
  .handler(async ({ data, context }) => {
    const role = await requireRole(context.supabase, context.userId, ["driver", "admin"]);
    const db = await admin();
    const order = await getOrder(db, data.orderId);
    if (order.driver_id !== context.userId && role !== "admin")
      throw new Error("Bukan pesanan Anda");

    const patch: Record<string, unknown> = { status: data.to };
    if (data.to === "selesai") patch['selesai_at'] = new Date().toISOString();
    if (data.to === "gagal_antar") {
      if (!data.alasan?.trim()) throw new Error("Alasan gagal antar wajib diisi");
      patch['alasan'] = data.alasan;
      const { data: profile } = await db
        .from("profiles")
        .select("saldo")
        .eq("id", order.customer_id)
        .maybeSingle();
      await db
        .from("profiles")
        .update({ saldo: (profile?.saldo ?? 0) + order.total })
        .eq("id", order.customer_id);
      await db.from("wallet_logs").insert({
        user_id: order.customer_id,
        jenis: "refund",
        jumlah: order.total,
        order_id: order.id,
        keterangan: `Refund gagal antar ${order.order_code}`,
      });
      patch['payment_status'] = "refunded";
    }
    await db.from("orders").update(patch).eq("id", order.id);
    await logStatus(
      db,
      order.id,
      order.status as Status,
      data.to,
      context.userId,
      role,
      data.alasan
    );
    return { ok: true };
  });

export const setDriverOnline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { online: boolean }) => input)
  .handler(async ({ data, context }) => {
    await requireRole(context.supabase, context.userId, ["driver", "admin"]);
    const db = await admin();
    await db
      .from("profiles")
      .update({ status_online: data.online })
      .eq("id", context.userId);
    return { online: data.online };
  });
