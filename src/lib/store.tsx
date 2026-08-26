import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { CartItem, Food } from "./types";

interface StoreState {
  cart: CartItem[];
  favorites: number[];
  balance: number;
}

interface StoreActions {
  addToCart: (food: Food, qty?: number, size?: string, extras?: string[]) => void;
  removeFromCart: (foodId: number) => void;
  updateQty: (foodId: number, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  getCartQty: (foodId: number) => number;
  getCartCount: () => number;
  getCartTotal: () => number;
  topUp: (amount: number) => void;
  pay: (amount: number) => boolean;
}

const StoreStateContext = createContext<StoreState | null>(null);
const StoreActionsContext = createContext<StoreActions | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [balance, setBalance] = useState(1250000);

  const addToCart = useCallback(
    (food: Food, qty = 1, size = "Regular", extras: string[] = []) => {
      setCart((prev) => {
        const existing = prev.find((x) => x.food.id === food.id);
        if (existing) {
          return prev.map((x) =>
            x.food.id === food.id ? { ...x, qty: x.qty + qty } : x
          );
        }
        return [...prev, { food, qty, size, extras }];
      });
      toast.success(`${food.name} added to cart`);
    },
    []
  );

  const removeFromCart = useCallback((foodId: number) => {
    setCart((prev) => prev.filter((x) => x.food.id !== foodId));
  }, []);

  const updateQty = useCallback((foodId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((x) => x.food.id !== foodId));
      return;
    }
    setCart((prev) =>
      prev.map((x) => (x.food.id === foodId ? { ...x, qty } : x))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  const getCartQty = useCallback(
    (foodId: number) => cart.find((x) => x.food.id === foodId)?.qty ?? 0,
    [cart]
  );

  const getCartCount = useCallback(
    () => cart.reduce((a, x) => a + x.qty, 0),
    [cart]
  );

  const getCartTotal = useCallback(
    () => cart.reduce((a, x) => a + x.food.price * x.qty, 0),
    [cart]
  );

  const topUp = useCallback((amount: number) => {
    setBalance((b) => b + amount);
  }, []);

  const pay = useCallback(
    (amount: number) => {
      if (balance < amount) {
        toast.error("Insufficient balance");
        return false;
      }
      setBalance((b) => b - amount);
      return true;
    },
    [balance]
  );

  const state = useMemo<StoreState>(
    () => ({ cart, favorites, balance }),
    [cart, favorites, balance]
  );

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
      topUp,
      pay,
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
      topUp,
      pay,
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
