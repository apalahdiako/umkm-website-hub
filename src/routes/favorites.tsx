import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { FoodCard } from "@/components/FoodCard";
import { useProducts } from "@/lib/catalog";
import { useStoreActions, useStoreState } from "@/lib/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Menu Favorit — Delivero POS" },
      { name: "description", content: "Menu favorit untuk transaksi cepat di kasir." },
      { property: "og:title", content: "Menu Favorit — Delivero POS" },
      { property: "og:description", content: "Menu favorit untuk transaksi cepat di kasir." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/favorites" }],
  }),
});

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useStoreState();
  const { toggleFavorite, addToCart } = useStoreActions();
  const { data: products = [] } = useProducts();

  const list = products.filter((x) => favorites.includes(x.id));

  return (
    <AppLayout>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-5 pl-16 backdrop-blur lg:px-8">
        <h1 className="font-display text-2xl font-bold text-brand">Favorites</h1>
      </header>

      <div className="px-5 pb-28 pt-5 lg:px-8 lg:pb-10">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm ring-1 ring-gray-100">
            <div className="grid size-16 place-items-center rounded-3xl bg-brand-soft">
              <Heart size={28} className="text-[#7c5cbf]" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-brand">
              Belum Ada Favorit
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Tandai menu yang sering dipesan agar muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {list.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                isFav={true}
                onFav={() => toggleFavorite(food.id)}
                onAdd={() => addToCart(food)}
                onDetail={() => navigate({ to: "/detail/$id", params: { id: food.id } })}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
