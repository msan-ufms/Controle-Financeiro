import {
  CheckCircle2,
  FileText,
  Pencil,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import type { Payable } from "../../types/payable";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import StatusBadge from "../ui/StatusBadge";
import PayableCard from "./PayableCard";

type PayableTableProps = {
  payables: Payable[];
  totalPayables: number;
  onEdit: (payable: Payable) => void;
  onMarkPaid: (payable: Payable) => void;
  onUnmarkPaid: (payable: Payable) => void;
  onRemove: (payable: Payable) => void;
};

export default function PayableTable({
  payables,
  totalPayables,
  onEdit,
  onMarkPaid,
  onUnmarkPaid,

  onRemove,
}: PayableTableProps) {
  //Página de Contas a Pagar.
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {/*cabeçalho*/}
            <tr>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-4 py-4">Categoria</th>
              <th className="px-4 py-4">Vencimento</th>
              <th className="px-4 py-4">Pagamento</th>
              <th className="px-4 py-4">Valor</th>
              <th className="px-4 py-4">Situação</th>
              <th className="px-4 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {" "}
            {/*corpo da tabela*/}
            {payables.map((payable) => (
              <tr key={payable.id} className="transition hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {payable.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500">
                  {payable.category}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {formatDate(payable.dueDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {payable.paymentDate ? formatDate(payable.paymentDate) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-extrabold text-slate-800">
                  {formatCurrency(payable.amount)}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={payable.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Editar conta"
                      onClick={() => onEdit(payable)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Pencil size={16} />
                    </button>
                    {payable.status !== "Paga" ? (
                      <button
                        type="button"
                        title="Marcar como paga"
                        aria-label="Marcar como paga"
                        onClick={() => onMarkPaid(payable)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        title="Desfazer pagamento"
                        aria-label="Desfazer pagamento"
                        onClick={() => onUnmarkPaid(payable)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Undo2 size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Excluir conta"
                      onClick={() => onRemove(payable)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {payables.map((payable) => (
          <PayableCard
            key={payable.id}
            payable={payable}
            onEdit={onEdit}
            onMarkPaid={onMarkPaid}
            onUnmarkPaid={onUnmarkPaid}
            onRemove={onRemove}
          />
        ))}
      </div>
      {payables.length === 0 && (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
            <Search size={21} />
          </div>
          <p className="mt-4 font-bold text-slate-800">
            Nenhuma conta encontrada
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Tente mudar a busca ou o filtro.
          </p>
        </div>
      )}
      <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:px-6">
        <span>
          {payables.length} de {totalPayables} contas
        </span>
        <span>Valores em reais (BRL)</span>
      </div>
    </section>
  );
}
