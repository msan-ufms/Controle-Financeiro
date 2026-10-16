import { Wallet } from "lucide-react";

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${light ? "text-white" : "text-slate-900"}`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
        <Wallet size={21} strokeWidth={2.5} />
      </div>
      <div>
        <div className="font-display text-lg font-extrabold tracking-tight">
          conta<span className="text-emerald-500">Fácil</span>
        </div>
        <div className="mt-[-4px] text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">
          controle financeiro
        </div>
      </div>
    </div>
  );
}
