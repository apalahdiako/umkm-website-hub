import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { FoodCard } from "@/components/FoodCard";
import { dishes } from "@/lib/types";
import { useStoreActions, useStoreState } from "@/lib/store";

const filters = ["Rating 4.5+", "Price", "Delivery Time", "Distance"];

export const Route = createFileRoute("/order")({
  component: OrderPage,
  head: () => ({
    meta: [
      { title: "Food Order — Delivero" },
      { name: "description", content: "Search and order your favorite dishes from local restaurants." },
      { property: "og:title", content: "Food Order — Delivero" },
      { property: "og:description", content: "Search and order your favorite dishes from local restaurants." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
});

function OrderPage() {
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useStoreState();
  const { toggleFavorite, addToCart } = useStoreActions();

  const visible = dishes.filter(
    (x) =>
      x.name.toLowerCase().includes(query.toLowerCase()) ||
      x.restaurant.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid size-10 place-items-center rounded-2xl bg-gray-100 transition hover:bg-gray-200 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display text-2xl font-bold text-brand">
            Food Order
          </h1>
        </div>
      </header>

      <div className="px-5 pb-28 pt-5 lg:px-8 lg:pb-10">
        {/* Search bar */}
        <div className="mb-5">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-gray-100 focus-within:ring-brand/30 transition">
            <Search size={17} className="flex-shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Search dishes, restaurants…"
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

        {/* Filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand/30">
            <SlidersHorizontal size={14} />
            Filters
          </button>
          {filters.map((f, i) => (
            <button
              key={f}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                i === 0
                  ? "bg-brand text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand/30"
              }`}
            >
              {f}
              {i === 0 && <X size={13} />}
              {i > 0 && <span className="text-gray-400">⌄</span>}
            </button>
          ))}
        </div>

        {/* Results count */}
        {query && (
          <p className="mb-4 text-sm text-gray-500">
            <span className="font-semibold text-brand">{visible.length}</span>{" "}
            result{visible.length !== 1 ? "s" : ""} for "
            <span className="font-medium">{query}</span>"
          </p>
        )}

        {/* Grid */}
        {visible.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                isFav={favorites.includes(food.id)}
                onFav={() => toggleFavorite(food.id)}
                onAdd={() => addToCart(food)}
                onDetail={() =>
                  navigate({ to: "/detail/$id", params: { id: String(food.id) } })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm ring-1 ring-gray-100">
            <div className="grid size-16 place-items-center rounded-3xl bg-brand-soft">
              <Search size={28} className="text-[#7c5cbf]" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-brand">
              No Results Found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Try a different keyword or browse categories.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-6 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
