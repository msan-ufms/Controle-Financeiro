import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc] lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-slate-100 bg-white lg:flex">
        <Sidebar />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative flex h-full w-[280px] flex-col bg-white">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:ml-[258px]">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1440px] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
