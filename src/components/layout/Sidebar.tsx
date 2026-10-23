import {
  Blocks,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { supabase } from "../../lib/supabase";

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
    },
    {
      to: "/relatorios",
      label: "Relatórios",
      icon: FileText,
      end: false,
    },
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
          onClick={async () => {
            try {
              //
              const { error } = await supabase.auth.signOut(); // O Supabase encerra a sessão autenticada.

              if (error) {
                console.error("Erro ao encerrar a sessão:", error);
                window.alert(
                  "Não foi possível sair da conta. Tente novamente.",
                );
                return;
              }

              navigate("/login", { replace: true }); // em caso de sucesso, o usuário é redirecionado para /login.
            } catch {
              window.alert("Erro de conexão ao tentar sair da conta.");
            }
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
        >
          <LogOut size={18} /> Sair da conta
        </button>
      </div>
    </>
  );
}
