import {
  Heart,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/order", label: "Order", icon: ShoppingBag },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/history", label: "History", icon: PackageCheck },
  { to: "/wallet", label: "Wallet", icon: WalletCards },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function isActive(to: string) {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-[72px] items-center justify-around border-t border-gray-100 bg-white px-1 lg:hidden safe-area-inset-bottom">
      {items.map(({ to, label, icon: Icon }) => {
        const on = isActive(to);
        return (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-1 py-2 transition-all"
          >
            <div
              className={`grid size-10 place-items-center rounded-2xl transition-all duration-200 ${
                on ? "bg-accent-yellow scale-110 shadow-[0_4px_12px_rgba(255,229,28,0.4)]" : ""
              }`}
            >
              <Icon
                size={20}
                strokeWidth={on ? 2.5 : 2}
                className={on ? "text-brand" : "text-gray-400"}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                on ? "text-brand" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
