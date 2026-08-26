import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Menu, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStoreActions, useStoreState } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — Delivero" },
      { name: "description", content: "Review your cart and complete your order." },
      { property: "og:title", content: "Checkout — Delivero" },
      { property: "og:description", content: "Review your cart and complete your order." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
});

function CheckoutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { cart, balance } = useStoreState();
  const { updateQty, removeFromCart, clearCart, pay } = useStoreActions();

  const subtotal = cart.reduce((a, x) => a + x.food.price * x.qty, 0);
  const deliveryFee = cart.length > 0 ? 2.99 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  const handlePay = () => {
    if (cart.length === 0) return;
    const ok = pay(total);
    if (ok) {
      clearCart();
      navigate({ to: "/" });
    }
  };

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
          <h1 className="font-display text-2xl font-bold text-brand">Checkout</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:px-8 lg:grid-cols-[1fr_360px]">
        {/* Cart items */}
        <div className="space-y-4 pb-28 lg:pb-0">
          {cart.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
              <h2 className="font-display text-xl font-bold text-brand">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Add some delicious dishes to get started.
              </p>
              <Link
                to="/order"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2d1080]"
              >
                <ChevronLeft size={16} />
                Browse Menu
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.food.id}
                className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className="size-20 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={item.food.image}
                    alt={item.food.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-display text-base font-bold text-brand">
                    {item.food.name}
                  </h3>
                  <p className="text-xs text-gray-500">{item.food.restaurant}</p>
                  <p className="mt-1 text-xs text-[#7c5cbf]">
                    {item.size} · {item.extras.length > 0 ? item.extras.join(", ") : "No extras"}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.food.id, item.qty - 1)}
                      className="grid size-7 place-items-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-brand">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.food.id, item.qty + 1)}
                      className="grid size-7 place-items-center rounded-lg bg-brand text-white transition hover:bg-[#2d1080]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-base font-bold text-brand">
                    ${(item.food.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.food.id)}
                    className="grid size-8 place-items-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <MapPin size={11} />
            Delivery Address
          </div>
          <p className="text-sm font-semibold text-brand">Emi Street 23</p>
          <p className="text-xs text-gray-400">Jakarta Selatan, 12190</p>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-brand">Total</span>
              <span className="font-display text-2xl font-bold text-brand">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={cart.length === 0 || balance < total}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-[#2d1080] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {balance < total && cart.length > 0
              ? "Insufficient Balance"
              : `Pay $${total.toFixed(2)}`}
          </button>
        </aside>
      </div>
    </AppLayout>
  );
}
