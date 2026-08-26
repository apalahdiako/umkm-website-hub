import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Delivero" },
      { name: "description", content: "Manage your account settings." },
      { property: "og:title", content: "Settings — Delivero" },
      { property: "og:description", content: "Manage your account settings." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/settings" }],
  }),
});

function SettingsPage() {
  return (
    <AppLayout>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-5 pl-16 backdrop-blur lg:px-8">
        <h1 className="font-display text-2xl font-bold text-brand">Settings</h1>
      </header>
      <div className="flex flex-col items-center justify-center px-5 pb-28 pt-20 lg:px-8 lg:pb-10">
        <div className="grid size-16 place-items-center rounded-3xl bg-brand-soft">
          <SettingsIcon size={28} className="text-[#7c5cbf]" />
        </div>
        <h2 className="mt-5 font-display text-xl font-bold text-brand">
          Settings
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Account settings will be available soon.
        </p>
      </div>
    </AppLayout>
  );
}
