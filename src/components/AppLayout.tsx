import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-brand">
      <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} />
      <main className="min-h-screen lg:pl-72">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
