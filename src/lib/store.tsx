import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "./types";

interface StoreState {
  cart: CartItem[];
  favorites: string[];
}

interface StoreActions {
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getCartQty: (productId: string) => number;
  getCartCount: () => number;
  getCartTotal: () => number;
}

const StoreStateContext = createContext<StoreState | null>(null);
const StoreActionsContext = createContext<StoreActions | null>(null);

const CART_KEY = "delivero.cart";
const FAV_KEY = "delivero.favorites";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      if (c) setCart(JSON.parse(c) as CartItem[]);
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.product.id === product.id);
      if (existing) {
        return prev.map((x) =>
          x.product.id === product.id ? { ...x, product, qty: x.qty + qty } : x
        );
      }
      return [...prev, { product, qty }];
    });
    toast.success(`${product.nama} masuk keranjang`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((x) => x.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((x) => x.product.id !== productId)
        : prev.map((x) => (x.product.id === productId ? { ...x, qty } : x))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const getCartQty = useCallback(
    (productId: string) => cart.find((x) => x.product.id === productId)?.qty ?? 0,
    [cart]
  );

  const getCartCount = useCallback(() => cart.reduce((a, x) => a + x.qty, 0), [cart]);

  const getCartTotal = useCallback(
    () => cart.reduce((a, x) => a + x.product.harga * x.qty, 0),
    [cart]
  );

  const state = useMemo<StoreState>(() => ({ cart, favorites }), [cart, favorites]);

  const actions = useMemo<StoreActions>(
    () => ({
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      toggleFavorite,
      isFavorite,
      getCartQty,
      getCartCount,
      getCartTotal,
    }),
    [
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      toggleFavorite,
      isFavorite,
      getCartQty,
      getCartCount,
      getCartTotal,
    ]
  );

  return (
    <StoreStateContext.Provider value={state}>
      <StoreActionsContext.Provider value={actions}>
        {children}
      </StoreActionsContext.Provider>
    </StoreStateContext.Provider>
  );
}

export function useStoreState() {
  const ctx = useContext(StoreStateContext);
  if (!ctx) throw new Error("useStoreState must be used within StoreProvider");
  return ctx;
}

export function useStoreActions() {
  const ctx = useContext(StoreActionsContext);
  if (!ctx) throw new Error("useStoreActions must be used within StoreProvider");
  return ctx;
}
