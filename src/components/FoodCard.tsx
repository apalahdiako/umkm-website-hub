import { Heart, Plus, Star } from "lucide-react";
import { FALLBACK_IMAGE, rupiah, type Product } from "@/lib/types";

interface FoodCardProps {
  food: Product;
  isFav: boolean;
  onFav: () => void;
  onAdd: () => void;
  onDetail: () => void;
}

export function FoodCard({ food, isFav, onFav, onAdd, onDetail }: FoodCardProps) {
  const soldOut = food.stok <= 0;

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(28,7,92,0.07)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(28,7,92,0.14)] hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={food.foto_url || FALLBACK_IMAGE}
          alt={food.nama}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-accent-yellow px-3 py-1 text-[11px] font-bold text-brand shadow-sm">
          {soldOut ? "Sold out" : `Stok ${food.stok}`}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFav();
          }}
          aria-label={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-110 active:scale-95"
        >
          <Heart
            size={15}
            strokeWidth={2}
            className={isFav ? "fill-rose-500 text-rose-500" : "text-gray-500"}
          />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm shadow-sm">
          <Star size={11} className="fill-accent-yellow text-accent-yellow" />
          <span className="text-xs font-bold text-brand">{food.rating}</span>
        </div>
      </div>

      <button onClick={onDetail} className="w-full px-4 pt-4 pb-2 text-left">
        <h3 className="font-display text-[15px] font-bold text-brand leading-snug line-clamp-1">
          {food.nama}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{food.restaurant}</p>
        <p className="mt-2 text-xs text-gray-400 line-clamp-1">{food.deskripsi}</p>
      </button>

      <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 mt-1">
        <span className="text-lg font-bold text-brand">{rupiah(food.harga)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          disabled={soldOut}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-bold text-white transition-all hover:bg-accent-yellow hover:text-brand active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white"
        >
          <Plus size={13} strokeWidth={2.5} />
          {soldOut ? "Habis" : "Add"}
        </button>
      </div>
    </article>
  );
}
