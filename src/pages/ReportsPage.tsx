import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Payable } from "../types/payable";
import { formatCurrency } from "../utils/currency";
import { getMonthOptions, getYearOptions } from "../utils/date";
import Select from "../components/ui/Select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportsPageProps = {
  payables: Payable[];
};

function ReportCard({
  label,
  count,
  amount,
  icon,
}: {
  label: string;
  count: number;
  amount: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-1 font-display text-xl font-extrabold text-slate-900">
          {formatCurrency(amount)}
        </p>
        <p className="mt-1 text-xs text-slate-500">{count} conta(s)</p>
      </div>
    </div>
  );
}

const CHART_COLORS = [
  "#059669",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
  "#14B8A6",
  "#F97316",
];

export default function ReportsPage({ payables }: ReportsPageProps) {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const monthOptions = [
    { label: "Ano inteiro", value: "all" },
    ...getMonthOptions(),
  ];

  const yearOptions = getYearOptions(
    payables.map((payable) => payable.dueDate),
  );

  const periodPayables = useMemo(
    () =>
      payables.filter((payable) => {
        const [year, month] = payable.dueDate.split("-");

        const matchesYear = Number(year) === Number(selectedYear);
        const matchesMonth =
          selectedMonth === "all" || Number(month) === Number(selectedMonth);

        return matchesYear && matchesMonth;
      }),
    [payables, selectedMonth, selectedYear],
  );

  const pending = periodPayables.filter(
    (payable) => payable.status === "Pendente",
  );

  const overdue = periodPayables.filter(
    (payable) => payable.status === "Vencida",
  );

  const paid = periodPayables.filter((payable) => payable.status === "Paga");

  const reportStats = {
    total: {
      count: periodPayables.length,
      amount: periodPayables.reduce((sum, payable) => sum + payable.amount, 0),
    },
    paid: {
      count: paid.length,
      amount: paid.reduce((sum, payable) => sum + payable.amount, 0),
    },
    open: {
      count: pending.length + overdue.length,
      amount: [...pending, ...overdue].reduce(
        (sum, payable) => sum + payable.amount,
        0,
      ),
    },
    pending: {
      count: pending.length,
      amount: pending.reduce((sum, payable) => sum + payable.amount, 0),
    },
    overdue: {
      count: overdue.length,
      amount: overdue.reduce((sum, payable) => sum + payable.amount, 0),
    },
  };

  // Contas detalhadas, ordenadas pela data de vencimento.
  const detailedPayables = useMemo(() => {
    return [...periodPayables].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );
  }, [periodPayables]);

  // Dados do gráfico de barras.
  const monthlyData = useMemo(() => {
    const months = getMonthOptions().filter(
      (month) => selectedMonth === "all" || month.value === selectedMonth,
    );

    return months.map((month) => {
      const monthPayables = periodPayables.filter(
        (payable) =>
          payable.dueDate.split("-")[1] === month.value.padStart(2, "0"),
      );

      return {
        month: month.label,
        monthValue: month.value,
        paid: monthPayables
          .filter((item) => item.status === "Paga")
          .reduce((sum, item) => sum + item.amount, 0),
        pending: monthPayables
          .filter((item) => item.status === "Pendente")
          .reduce((sum, item) => sum + item.amount, 0),
        overdue: monthPayables
          .filter((item) => item.status === "Vencida")
          .reduce((sum, item) => sum + item.amount, 0),
      };
    });
  }, [periodPayables, selectedMonth]);

  // Dados do gráfico de pizza.
  const categoryData = useMemo(() => {
    const grouped = periodPayables.reduce<Record<string, number>>(
      (result, payable) => {
        result[payable.category] =
          (result[payable.category] || 0) + payable.amount;

        return result;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [periodPayables]);

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-sm font-semibold text-emerald-700">
          ACOMPANHAMENTO FINANCEIRO
        </p>

        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          Relatórios
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Analise suas despesas e acompanhe a situação das suas contas.
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

      <section>
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold text-slate-800">
            Resumo do período
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores das contas com vencimento no período selecionado.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <ReportCard
            label="Todas as contas"
            count={reportStats.total.count}
            amount={reportStats.total.amount}
            icon={<FileText size={17} />}
          />

          <ReportCard
            label="Contas pagas"
            count={reportStats.paid.count}
            amount={reportStats.paid.amount}
            icon={<CheckCircle2 size={17} />}
          />

          <ReportCard
            label="Contas em aberto"
            count={reportStats.open.count}
            amount={reportStats.open.amount}
            icon={<Wallet size={17} />}
          />

          <ReportCard
            label="Contas a vencer"
            count={reportStats.pending.count}
            amount={reportStats.pending.amount}
            icon={<Clock3 size={17} />}
          />

          <ReportCard
            label="Contas vencidas"
            count={reportStats.overdue.count}
            amount={reportStats.overdue.amount}
            icon={<AlertCircle size={17} />}
          />
        </div>
      </section>

      {/* Gráfico de despesas por categoria */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold text-slate-800">
            Despesas por categoria
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Distribuição dos valores das contas por categoria no período
            selecionado.
          </p>
        </div>

        {categoryData.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <p className="font-semibold text-slate-700">
                Nenhuma despesa encontrada
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Não existem contas cadastradas para o período selecionado.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {categoryData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {categoryData.map((item, index) => {
                const total = categoryData.reduce(
                  (sum, category) => sum + category.value,
                  0,
                );

                const percentage = total > 0 ? (item.value / total) * 100 : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-sm text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {formatCurrency(item.value)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Gráfico de situação das contas por mês */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold text-slate-800">
            Situação das contas por mês
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Valores das contas agrupados pela data de vencimento.
          </p>
        </div>

        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 8, left: 8, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />

              <Tooltip formatter={(value) => formatCurrency(Number(value))} />

              <Legend />

              <Bar dataKey="paid" name="Pagas" stackId="a" fill="#059669" />

              <Bar
                dataKey="pending"
                name="A vencer"
                stackId="a"
                fill="#F59E0B"
              />

              <Bar
                dataKey="overdue"
                name="Vencidas"
                stackId="a"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tabela de detalhamento */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Detalhamento das contas
          </h2>
          <p className="text-sm text-slate-500">
            {detailedPayables.length} contas encontradas no período selecionado.
          </p>
        </div>

        {detailedPayables.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Nenhuma conta encontrada para o período selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-3 py-3 font-medium">Descrição</th>
                  <th className="px-3 py-3 font-medium">Categoria</th>
                  <th className="px-3 py-3 font-medium">Vencimento</th>
                  <th className="px-3 py-3 font-medium">Pagamento</th>
                  <th className="px-3 py-3 text-right font-medium">Valor</th>
                  <th className="px-3 py-3 font-medium">Situação</th>
                </tr>
              </thead>

              <tbody>
                {detailedPayables.map((payable) => (
                  <tr
                    key={payable.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-3 py-4 font-medium text-slate-700">
                      {payable.description}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {payable.category}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {new Date(
                        `${payable.dueDate}T00:00:00`,
                      ).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {payable.paymentDate
                        ? new Date(
                            `${payable.paymentDate}T00:00:00`,
                          ).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-3 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(payable.amount)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          payable.status === "Paga"
                            ? "bg-emerald-50 text-emerald-700"
                            : payable.status === "Vencida"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {payable.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
