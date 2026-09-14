import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { FoodCard } from "@/components/FoodCard";
import { useCategories, useProducts } from "@/lib/catalog";
import { useStoreActions, useStoreState } from "@/lib/store";

export const Route = createFileRoute("/order")({
  component: OrderPage,
  head: () => ({
    meta: [
      { title: "Daftar Menu — Delivero POS" },
      { name: "description", content: "Pilih menu dan buat transaksi kasir secara langsung." },
      { property: "og:title", content: "Daftar Menu — Delivero POS" },
      {
        property: "og:description",
        content: "Pilih menu dan buat transaksi kasir secara langsung.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
});

function OrderPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const navigate = useNavigate();
  const { favorites } = useStoreState();
  const { toggleFavorite, addToCart } = useStoreActions();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const visible = products.filter(
    (x) =>
      (!cat || x.category_id === cat) &&
      (x.nama.toLowerCase().includes(query.toLowerCase()) ||
        x.restaurant.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <AppLayout>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-5 pl-16 backdrop-blur lg:px-8">
        <h1 className="font-display text-2xl font-bold text-brand">Food Order</h1>
      </header>

      <div className="px-5 pb-28 pt-5 lg:px-8 lg:pb-10">
        <div className="mb-5">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-gray-100 focus-within:ring-brand/30 transition">
            <Search size={17} className="flex-shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Cari menu…"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand/30">
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <button
            onClick={() => setCat(null)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              cat === null
                ? "bg-brand text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand/30"
            }`}
          >
            🍽️ Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                cat === c.id
                  ? "bg-brand text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand/30"
              }`}
            >
              {c.icon ?? "🍽️"} {c.nama}
            </button>
          ))}
        </div>

        {query && (
          <p className="mb-4 text-sm text-gray-500">
            <span className="font-semibold text-brand">{visible.length}</span> hasil untuk "
            <span className="font-medium">{query}</span>"
          </p>
        )}

        {visible.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                isFav={favorites.includes(food.id)}
                onFav={() => toggleFavorite(food.id)}
                onAdd={() => addToCart(food)}
                onDetail={() => navigate({ to: "/detail/$id", params: { id: food.id } })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm ring-1 ring-gray-100">
            <div className="grid size-16 place-items-center rounded-3xl bg-brand-soft">
              <Search size={28} className="text-[#7c5cbf]" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-brand">
              {isLoading ? "Memuat menu…" : "Menu Tidak Ditemukan"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Coba kata kunci lain atau pilih kategori berbeda.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
