import { ArrowUpRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Payable } from "../../types/payable";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import StatusBadge from "../ui/StatusBadge";

export default function RecentPayables({ payables }: { payables: Payable[] }) {
  const navigate = useNavigate();
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="font-display text-lg font-extrabold text-slate-900">
            Contas recentes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {" "}
            Confira as últimas contas cadastradas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/contas")}
          className="text-left text-sm font-bold text-emerald-700 hover:text-emerald-900"
        >
          Ver todas as contas <ArrowUpRight className="ml-1 inline" size={15} />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {payables.slice(0, 4).map((payable) => (
          <div
            key={payable.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {payable.description}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {payable.category} · Vence em {formatDate(payable.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-extrabold text-slate-800">
                {formatCurrency(payable.amount)}
              </span>
              <StatusBadge status={payable.status} />
            </div>
          </div>
        ))}
        {payables.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            Ainda não há contas cadastradas.
          </p>
        )}
      </div>
    </section>
  );
}
