import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import type { PayableStatus } from "../../types/payable";

export default function StatusBadge({ status }: { status: PayableStatus }) {
  const styles =
    status === "Paga"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Vencida"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";
  const Icon =
    status === "Paga" ? CheckCircle2 : status === "Vencida" ? AlertCircle : Clock3;

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold ${styles}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}