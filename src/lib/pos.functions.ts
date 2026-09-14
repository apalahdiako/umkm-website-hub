import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PosPaymentMethod = "tunai" | "qris" | "kartu" | "ewallet";
export type PosOrderType = "dine_in" | "takeaway" | "delivery";

export type PosOrderInput = {
  items: { product_id: string; qty: number; note?: string }[];
  orderType: PosOrderType;
  metodeBayar: PosPaymentMethod;
  diterima: number;
  catatan?: string;
  customerName?: string;
  held?: boolean;
};

export type PosOrderResult = {
  id: string;
  order_code: string;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  change: number;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createPosOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PosOrderInput) => {
    if (!Array.isArray(input.items) || input.items.length === 0)
      throw new Error("Keranjang kosong");
    if (!["dine_in", "takeaway", "delivery"].includes(input.orderType))
      throw new Error("Tipe order tidak valid");
    if (!["tunai", "qris", "kartu", "ewallet"].includes(input.metodeBayar))
      throw new Error("Metode bayar tidak valid");
    return input;
  })
  .handler(async ({ data, context }): Promise<PosOrderResult> => {
    const db = await admin();

    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await db
      .from("products")
      .select("id, nama, harga, stok, aktif, category_id")
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
        note: it.note ?? null,
      };
    });

    // Pajak & service charge mengikuti pengaturan outlet aktif (jika ada)
    const { data: outlet } = await db
      .from("outlets")
      .select("id, pajak_persen, service_persen")
      .eq("aktif", true)
      .limit(1)
      .maybeSingle();

    const tax = Math.round((subtotal * Number(outlet?.pajak_persen ?? 0)) / 100);
    const service = Math.round((subtotal * Number(outlet?.service_persen ?? 0)) / 100);
    const total = subtotal + tax + service;

    const held = data.held === true;
    if (!held && data.metodeBayar === "tunai" && data.diterima < total)
      throw new Error("Uang diterima kurang dari total tagihan");

    const paid = held ? 0 : data.metodeBayar === "tunai" ? Math.floor(data.diterima) : total;
    const change = held ? 0 : Math.max(0, paid - total);

    const orderCode = `POS-${Date.now().toString(36).toUpperCase()}`;
    const { data: order, error: oErr } = await db
      .from("orders")
      .insert({
        order_code: orderCode,
        customer_name: data.customerName?.trim() || null,
        kasir_id: context.userId,
        outlet_id: outlet?.id ?? null,
        order_type: data.orderType,
        status: held ? "hold" : "dibayar",
        held,
        metode_bayar: data.metodeBayar,
        catatan: data.catatan ?? null,
        items: rows,
        subtotal,
        tax,
        service_charge: service,
        total,
        paid_amount: paid,
        change_amount: change,
        payment_status: held ? "pending" : "paid",
        paid_at: held ? null : new Date().toISOString(),
        source: "pos",
      })
      .select("id, order_code")
      .single();
    if (oErr) throw new Error(oErr.message);

    await db.from("order_items").insert(rows.map((r) => ({ ...r, order_id: order.id })));

    if (!held) {
      await db.from("payments").insert({
        order_id: order.id,
        metode: data.metodeBayar,
        jumlah: total,
        diterima: paid,
        kembalian: change,
      });
      for (const r of rows) {
        await db.rpc("adjust_product_stock", { _product_id: r.product_id, _delta: -r.qty });
      }
      await db.from("kds_tickets").insert({
        order_id: order.id,
        station: "dapur",
        status: "baru",
        items: rows,
      });
    }

    await db.from("audit_logs").insert({
      user_id: context.userId,
      aksi: held ? "hold_order" : "transaksi",
      entitas: "orders",
      entitas_id: order.id,
      sesudah: { order_code: order.order_code, total, metode: data.metodeBayar },
    });

    return {
      id: order.id,
      order_code: order.order_code,
      subtotal,
      tax,
      service_charge: service,
      total,
      change,
    };
  });

export const voidOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string; reason: string }) => {
    if (!input.reason?.trim()) throw new Error("Alasan void wajib diisi");
    return input;
  })
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: order, error } = await db
      .from("orders")
      .select("id, status, order_code")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Pesanan tidak ditemukan");
    if (order.status === "void") throw new Error("Pesanan sudah void");

    await db
      .from("orders")
      .update({
        status: "void",
        void_reason: data.reason,
        voided_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    const { data: items } = await db
      .from("order_items")
      .select("product_id, qty")
      .eq("order_id", order.id);
    for (const it of items ?? []) {
      if (it.product_id)
        await db.rpc("adjust_product_stock", { _product_id: it.product_id, _delta: it.qty });
    }

    await db.from("audit_logs").insert({
      user_id: context.userId,
      aksi: "void",
      entitas: "orders",
      entitas_id: order.id,
      sesudah: { alasan: data.reason },
    });
    return { ok: true };
  });
