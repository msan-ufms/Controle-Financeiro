import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Payable } from "../types/payable";
import { formatCurrency } from "../utils/currency";
import SummaryCard from "../components/dashboard/SummaryCard";
import RecentPayables from "../components/dashboard/RecentPayables";
import Button from "../components/ui/Button";
import {
  getFormattedToday,
  getMonthOptions,
  getYearOptions,
} from "../utils/date";
import { useState } from "react";
import Select from "../components/ui/Select";

export default function DashboardPage({ payables }: { payables: Payable[] }) {
  const navigate = useNavigate();

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1),
  );

  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const monthOptions = [
    { label: "Ano inteiro", value: "all" },
    ...getMonthOptions(),
  ];

  const yearOptions = getYearOptions(
    payables.map((payable) => payable.dueDate),
  );

  const periodPayables = payables.filter((payable) => {
    const [year, month] = payable.dueDate.split("-");

    const matchesYear = Number(year) === Number(selectedYear);

    const matchesMonth =
      selectedMonth === "all" || Number(month) === Number(selectedMonth);

    return matchesYear && matchesMonth;
  });

  const pending = periodPayables.filter(
    (payable) => payable.status === "Pendente",
  );

  const overdue = periodPayables.filter(
    (payable) => payable.status === "Vencida",
  );

  const paid = periodPayables.filter((payable) => payable.status === "Paga");

  const totalPending = pending.reduce(
    (sum, payable) => sum + payable.amount,
    0,
  );

  const totalOverdue = overdue.reduce(
    (sum, payable) => sum + payable.amount,
    0,
  );

  const totalPaid = paid.reduce((sum, payable) => sum + payable.amount, 0);

  const totalOpen = totalPending + totalOverdue;

  const totalCount = periodPayables.length;

  const totalAmount = periodPayables.reduce(
    (sum, payable) => sum + payable.amount,
    0,
  );

  const openCount = pending.length + overdue.length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            {getFormattedToday()}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Seu financeiro, em dia.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Aqui está um resumo das suas contas a pagar.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="w-full sm:w-48">
              <Select
                label="Período"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                options={monthOptions}
              />
            </div>

            <div className="w-full sm:w-32">
              <Select
                label="Ano"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                options={yearOptions}
              />
            </div>
          </div>
        </div>
        <Button onClick={() => navigate("/contas?nova=1")}>
          <Plus size={17} /> Nova conta
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Todas as contas"
          amount={formatCurrency(totalAmount)}
          note={`${totalCount} conta(s) no período`}
          icon={<FileText size={19} />}
          tone="dark"
        />

        <SummaryCard
          label="Contas pagas"
          amount={formatCurrency(totalPaid)}
          note={`${paid.length} conta(s) pagas`}
          icon={<CheckCircle2 size={19} />}
          tone="blue"
        />

        <SummaryCard
          label="Contas em aberto"
          amount={formatCurrency(totalOpen)}
          note={`${openCount} conta(s) em aberto`}
          icon={<Wallet size={19} />}
          tone="dark"
        />

        <SummaryCard
          label="Contas a vencer"
          amount={formatCurrency(totalPending)}
          note={`${pending.length} conta(s) a vencer`}
          icon={<Clock3 size={19} />}
          tone="green"
        />

        <SummaryCard
          label="Contas vencidas"
          amount={formatCurrency(totalOverdue)}
          note={`${overdue.length} conta(s) vencidas`}
          icon={<AlertCircle size={19} />}
          tone="rose"
        />
      </div>
      <RecentPayables payables={payables} />
    </div>
  );
}
