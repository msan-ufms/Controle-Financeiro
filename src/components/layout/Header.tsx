import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let active = true; //let active = true: indica que o efeito está ativo.
    // Consulta o usuário e o perfil...
    async function loadUserProfile() {
      //Obtém o usuário autenticado.
      // Consulta o perfil...
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active || userError || !user) {
        return;
      }

      setUserEmail(user.email ?? "");

      //Consulta o nome na tabela profiles, atualizando o nome.

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      //Usa o nome dos metadados como alternativa caso não consiga obter o perfil.
      if (!profileError && profile?.name) {
        setUserName(profile.name);
      } else {
        setUserName(user.user_metadata?.name ?? "");
      }
    }

    void loadUserProfile();

    ////função de limpeza executada quando o componente é desmontado ou quando o efeito é encerrado.
    return () => {
      active = false;
    };
  }, []);

  const displayName = userName.trim() || userEmail || "Usuário";

  //Calcula as iniciais para o avatar.
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const pageTitles: Record<string, string> = {
    //adicionar conforme as páginas
    "/": "Visão geral",
    "/contas": "Contas a pagar",
    "/categorias": "Categorias",
    "/relatorios": "Relatórios",
  };

  const pageTitle = pageTitles[location.pathname] ?? "Visão geral";

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>
        <div>
          <p className="font-display text-sm font-extrabold text-slate-800 sm:text-base">
            {pageTitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-800">
            {initials}
          </div>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-extrabold text-slate-800">
              {displayName}
            </span>
            <span className="block text-[11px] text-slate-400">
              {userEmail || "Conta pessoal"}
            </span>
          </span>
          <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
