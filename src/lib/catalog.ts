import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Order, Product } from "./types";

/** Subscribe ke perubahan tabel dan refresh query terkait (realtime). */
function useRealtime(table: string, keys: string[]) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`rt-${table}-${keys.join("-")}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, table, keys.join("-")]);
}

export function useCategories() {
  useRealtime("categories", ["categories"]);
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, nama, icon")
        .order("nama");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useProducts() {
  useRealtime("products", ["products"]);
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, nama, category_id, restaurant, deskripsi, harga, stok, foto_url, rating, aktif",
        )
        .eq("aktif", true)
        .order("nama");
      if (error) throw new Error(error.message);
      return (data ?? []) as Product[];
    },
  });
}

export function useProduct(id: string) {
  const { data, ...rest } = useProducts();
  return { ...rest, data: data?.find((p) => p.id === id) ?? null };
}

export function useOrders(limit = 50) {
  useRealtime("orders", ["orders"]);
  return useQuery({
    queryKey: ["orders", limit],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Order[];
    },
  });
}
