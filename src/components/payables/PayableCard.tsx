import { CheckCircle2, FileText, Pencil, Trash2, Undo2 } from "lucide-react";
import type { Payable } from "../../types/payable";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import StatusBadge from "../ui/StatusBadge";

type PayableCardProps = {
  payable: Payable;
  onEdit: (payable: Payable) => void;
  onMarkPaid: (payable: Payable) => void;
  onUnmarkPaid: (payable: Payable) => void;
  onRemove: (payable: Payable) => void;
};

export default function PayableCard({
  payable,
  onEdit,
  onMarkPaid,
  onUnmarkPaid,

  onRemove,
}: PayableCardProps) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800">{payable.description}</p>
            <p className="mt-1 text-xs text-slate-400">{payable.category}</p>
          </div>
        </div>
        <StatusBadge status={payable.status} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Vence em {formatDate(payable.dueDate)}
          </p>
          {payable.paymentDate && (
            <p className="mt-1 text-xs text-emerald-700">
              Pago em {formatDate(payable.paymentDate)}
            </p>
          )}
          <p className="mt-1 font-display text-lg font-extrabold">
            {formatCurrency(payable.amount)}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Editar"
            onClick={() => onEdit(payable)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <Pencil size={16} />
          </button>
          {payable.status !== "Paga" ? (
            <button
              type="button"
              aria-label="Marcar como paga"
              title="Marcar como paga"
              onClick={() => onMarkPaid(payable)}
              className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
            >
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Desfazer pagamento"
              title="Desfazer pagamento"
              onClick={() => onUnmarkPaid(payable)}
              className="rounded-lg p-2 text-amber-700 hover:bg-amber-50"
            >
              <Undo2 size={16} />
            </button>
          )}
          <button
            type="button"
            aria-label="Excluir"
            onClick={() => onRemove(payable)}
            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
