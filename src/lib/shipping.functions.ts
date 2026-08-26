import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RAJAONGKIR_BASE = "https://rajaongkir.komerce.id/api/v1";

export interface Destination {
  id: string;
  label: string;
  zipCode: string;
}

export interface ShippingOption {
  courier: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

/** Cari kota/kecamatan tujuan pengiriman (RajaOngkir Komerce). */
export const searchDestination = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ search: z.string().min(3).max(80) }).parse(d))
  .handler(async ({ data }): Promise<Destination[]> => {
    const key = process.env["RAJAONGKIR_API_KEY"];
    if (!key) throw new Error("RAJAONGKIR_API_KEY belum diatur");

    const url = `${RAJAONGKIR_BASE}/destination/domestic-destination?search=${encodeURIComponent(
      data.search,
    )}&limit=15&offset=0`;
    const res = await fetch(url, { headers: { key } });
    const body = await res.text();
    if (!res.ok) throw new Error(`RajaOngkir gagal [${res.status}]: ${body}`);

    const json = JSON.parse(body) as { data?: Array<Record<string, unknown>> };
    return (json.data ?? []).map((row) => ({
      id: String(row["id"] ?? ""),
      label: String(row["label"] ?? row["subdistrict_name"] ?? ""),
      zipCode: String(row["zip_code"] ?? ""),
    }));
  });

/** Hitung ongkos kirim dari gudang ke tujuan. */
export const calculateShipping = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        destinationId: z.string().min(1).max(20),
        weight: z.number().int().min(1).max(50000),
        couriers: z.string().min(2).max(120).default("jne:sicepat:jnt:pos"),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<ShippingOption[]> => {
    const key = process.env["RAJAONGKIR_API_KEY"];
    if (!key) throw new Error("RAJAONGKIR_API_KEY belum diatur");
    const origin = process.env["RAJAONGKIR_ORIGIN_ID"] ?? "17473";

    const form = new URLSearchParams({
      origin,
      destination: data.destinationId,
      weight: String(data.weight),
      courier: data.couriers,
      price: "lowest",
    });

    const res = await fetch(`${RAJAONGKIR_BASE}/calculate/domestic-cost`, {
      method: "POST",
      headers: { key, "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`RajaOngkir gagal [${res.status}]: ${body}`);

    const json = JSON.parse(body) as { data?: Array<Record<string, unknown>> };
    return (json.data ?? []).map((row) => ({
      courier: String(row["code"] ?? ""),
      courierName: String(row["name"] ?? ""),
      service: String(row["service"] ?? ""),
      description: String(row["description"] ?? ""),
      cost: Number(row["cost"] ?? 0),
      etd: String(row["etd"] ?? "-"),
    }));
  });
