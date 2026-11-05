import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import Select from "../ui/Select";

type PayableFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  resultCount: number;
  month: number;
  year: number;
  monthOptions: { label: string; value: string }[];
  yearOptions: { label: string; value: string }[];
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export default function PayableFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  resultCount,
  month,
  year,
  monthOptions,
  yearOptions,
  onMonthChange,
  onYearChange,
  onPreviousMonth,
  onNextMonth,
}: PayableFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-lg font-extrabold text-slate-900">
            Lista de contas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {resultCount} resultado(s) encontrado(s)
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPreviousMonth}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={17} />
            </button>

            <Select
              aria-label="Selecionar mês"
              value={String(month)}
              onChange={(event) => onMonthChange(Number(event.target.value))}
              className="py-2.5"
              options={monthOptions}
            />

            <Select
              aria-label="Selecionar ano"
              value={String(year)}
              onChange={(event) => onYearChange(Number(event.target.value))}
              className="py-2.5"
              options={yearOptions}
            />

            <button
              type="button"
              onClick={onNextMonth}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              aria-label="Próximo mês"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar conta..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 sm:w-56"
            />
          </label>
          <label className="relative block">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Select
              aria-label="Filtrar por situação"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="py-2.5 pl-9 pr-8 sm:w-40"
              options={[
                { label: "Todas", value: "Todas" },
                { label: "Pagas", value: "Paga" },
                { label: "Em aberto", value: "Em aberto" },
                { label: "A vencer", value: "Pendente" },
                { label: "Vencida", value: "Vencida" },
              ]}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
