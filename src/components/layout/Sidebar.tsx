import {
  Blocks,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const nav = [
    { to: "/", label: "Visão geral", icon: LayoutDashboard, end: true },
    { to: "/contas", label: "Contas a pagar", icon: CreditCard, end: false },
    {
      to: "/categorias",
      label: "Categorias",
      icon: Blocks,
      end: false,
    } /* quando implementar vai ser /categorias*/,
    {
      to: "/relatorios",
      label: "Relatórios",
      icon: FileText,
      end: false,
    } /* quando implementar vai ser /categorias*/,
  ];

  return (
    <>
      <div className="px-6 pb-8 pt-7">
        <Brand />
      </div>
      <div className="px-4">
        <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">
          Menu principal
        </p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto p-4">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          <LogOut size={18} /> Sair da conta
        </button>
      </div>
    </>
  );
}
