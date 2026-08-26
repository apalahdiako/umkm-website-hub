import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { FoodCard } from "@/components/FoodCard";
import { dishes } from "@/lib/types";
import { useStoreActions, useStoreState } from "@/lib/store";

const categories = [
  { label: "All", emoji: "🍽️" },
  { label: "Burgers", emoji: "🍔" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Sushi", emoji: "🍣" },
  { label: "Chicken", emoji: "🍗" },
  { label: "Beverage", emoji: "🥤" },
  { label: "Bakery", emoji: "🧁" },
  { label: "Seafood", emoji: "🐟" },
];

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Delivero" },
      { name: "description", content: "Browse popular dishes and order your favorite food." },
      { property: "og:title", content: "Dashboard — Delivero" },
      { property: "og:description", content: "Browse popular dishes and order your favorite food." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useStoreState();
  const { toggleFavorite, addToCart } = useStoreActions();

  return (
    <AppLayout>
      {/* Mobile-only top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 lg:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} className="text-brand" />
            <span>Emi Street 23, Jakarta</span>
          </div>
          <h1 className="mt-0.5 font-display text-xl font-bold text-brand">
            Hey, Samantha 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid size-10 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <Bell size={18} className="text-gray-600" />
          </button>
          <Link
            to="/checkout"
            className="relative grid size-10 place-items-center rounded-2xl bg-brand"
          >
            <ShoppingCart size={18} className="text-white" />
          </Link>
        </div>
      </div>

      {/* Desktop greeting */}
      <div className="hidden lg:block px-8 pt-8 pb-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand shadow-sm ring-1 ring-gray-100 lg:hidden"
        >
          <Menu size={16} />
          Menu
        </button>
        <h1 className="font-display text-3xl font-bold text-brand">
          Hey, Samantha 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">What are you craving today?</p>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6 px-5 pb-28 pt-4 lg:px-8 lg:pb-10">
          {/* Search bar */}
          <div className="flex gap-3">
            <label className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-gray-100/80 focus-within:ring-brand/30 transition">
              <Search size={17} className="flex-shrink-0 text-gray-400" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                placeholder="Search dishes, restaurants…"
              />
            </label>
            <button
              className="flex-shrink-0 grid place-items-center rounded-2xl bg-brand transition hover:brightness-110 active:scale-95"
              style={{ width: 52, height: 52 }}
            >
              <SlidersHorizontal size={18} className="text-white" />
            </button>
          </div>

          {/* Promo Banner */}
          <div
            className="relative overflow-hidden rounded-3xl bg-brand px-6 py-7"
            style={{ minHeight: 164 }}
          >
            {/* Text */}
            <div className="relative z-10 max-w-[58%]">
              <span className="inline-block rounded-full bg-accent-yellow px-3 py-1 text-[11px] font-bold text-brand">
                🔥 Today's Special
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">
                Get 30% Off
                <br />
                Your First Order
              </h2>
              <Link
                to="/order"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-yellow px-4 py-2.5 text-sm font-bold text-brand transition hover:brightness-105 active:scale-95"
              >
                Order Now <ChevronRight size={14} />
              </Link>
            </div>
            {/* Food image right side */}
            <div className="absolute right-0 top-0 h-full w-[44%]">
              <img
                src="https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=320&h=200&fit=crop&auto=format"
                alt="Promo burger"
                className="h-full w-full object-cover"
                style={{ clipPath: "polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/40 to-transparent" />
            </div>
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-6 flex gap-1.5 z-10">
              <span className="h-1.5 w-5 rounded-full bg-accent-yellow" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-brand">
                Categories
              </h2>
              <button className="text-sm text-[#7c5cbf] hover:text-brand transition">
                See all
              </button>
            </div>
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setActiveCategory(c.label)}
                  className={`flex flex-shrink-0 flex-col items-center gap-1.5 rounded-2xl px-4 py-3 text-center transition-all duration-200 ${
                    activeCategory === c.label
                      ? "bg-brand text-white shadow-[0_4px_16px_rgba(28,7,92,0.3)]"
                      : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-100 hover:ring-brand/20"
                  }`}
                >
                  <span className="text-xl leading-none">{c.emoji}</span>
                  <span className="text-[11px] font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Popular Dishes */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-brand">
                Popular Dishes
              </h2>
              <Link
                to="/order"
                className="text-sm text-[#7c5cbf] hover:text-brand transition"
              >
                See all →
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {dishes.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  isFav={favorites.includes(food.id)}
                  onFav={() => toggleFavorite(food.id)}
                  onAdd={() => addToCart(food)}
                  onDetail={() => navigate({ to: "/detail/$id", params: { id: String(food.id) } })}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar (desktop only) */}
        <aside className="hidden xl:flex flex-col gap-5 px-4 py-6">
          {/* Balance Card */}
          <div className="rounded-3xl bg-gradient-to-br from-brand to-[#3e1595] p-5 text-white">
            <p className="text-[11px] uppercase tracking-widest text-white/50">
              Total Balance
            </p>
            <h3 className="mt-1.5 font-display text-3xl font-bold">$1,250.00</h3>
            <p className="mt-1 text-xs tracking-widest text-white/40">
              •••• •••• •••• 4209
            </p>
            <div className="mt-5 flex gap-2.5">
              <Link
                to="/wallet"
                className="rounded-xl bg-accent-yellow px-4 py-2.5 text-xs font-bold text-brand transition hover:brightness-105"
              >
                Top Up
              </Link>
              <button className="rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25">
                Transfer
              </button>
            </div>
          </div>

          {/* Delivery address */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              <MapPin size={11} />
              Delivery Address
            </div>
            <p className="mt-2.5 text-sm font-semibold text-brand">Emi Street 23</p>
            <p className="mt-0.5 text-xs text-gray-400">Jakarta Selatan, 12190</p>
            <button className="mt-3 text-xs font-medium text-[#7c5cbf] hover:text-brand transition">
              Change address →
            </button>
          </div>

          {/* Recent Order */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-display text-base font-bold text-brand">
              Recent Order
            </h3>
            <div className="mt-4 space-y-3">
              {dishes.slice(0, 3).map((food) => (
                <div key={food.id} className="flex items-center gap-3">
                  <div className="size-11 overflow-hidden rounded-xl flex-shrink-0 bg-gray-100">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-brand">
                      {food.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {food.restaurant}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand">
                    ${food.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
