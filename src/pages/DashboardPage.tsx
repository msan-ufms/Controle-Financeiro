import { AlertCircle, ArrowDownLeft, Check, Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Payable } from "../types/payable";
import { formatCurrency } from "../utils/currency";
import SummaryCard from "../components/dashboard/SummaryCard";
import RecentPayables from "../components/dashboard/RecentPayables";
import Button from "../components/ui/Button";

export default function DashboardPage({ payables }: { payables: Payable[] }) {
  const navigate = useNavigate();
  const pending = payables.filter((payable) => payable.status === "Pendente");
  const overdue = payables.filter((payable) => payable.status === "Vencida");
  const paid = payables.filter((payable) => payable.status === "Paga");
  const totalPending = pending.reduce(
    (sum, payable) => sum + payable.amount,
    0,
  );
  const totalOverdue = overdue.reduce(
    (sum, payable) => sum + payable.amount,
    0,
  );
  const totalPaid = paid.reduce((sum, payable) => sum + payable.amount, 0);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            QUINTA-FEIRA, 15 DE OUTUBRO
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Seu financeiro, em dia.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Aqui está um resumo das suas contas a pagar.
          </p>
        </div>
        <Button onClick={() => navigate("/contas?nova=1")}>
          <Plus size={17} /> Nova conta
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total em aberto"
          amount={formatCurrency(totalPending + totalOverdue)}
          note="Contas que ainda precisam de atenção"
          icon={<Wallet size={19} />}
          tone="dark"
        />
        <SummaryCard
          label="A vencer"
          amount={formatCurrency(totalPending)}
          note={`${pending.length} contas pendentes`}
          icon={<ArrowDownLeft size={19} />}
          tone="green"
        />
        <SummaryCard
          label="Contas vencidas"
          amount={formatCurrency(totalOverdue)}
          note={`${overdue.length} conta(s) atrasada(s)`}
          icon={<AlertCircle size={19} />}
          tone="rose"
        />
        <SummaryCard
          label="Total pago"
          amount={formatCurrency(totalPaid)}
          note={`${paid.length} conta(s) quitada(s)`}
          icon={<Check size={19} />}
          tone="blue"
        />
      </div>
      <RecentPayables payables={payables} />
    </div>
  );
}
