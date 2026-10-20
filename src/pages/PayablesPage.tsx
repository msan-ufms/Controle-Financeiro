import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { FileText, Plus, Wallet, Clock3, X } from "lucide-react";
import type {
  Payable,
  PayableFormValues,
  PayableStatus,
} from "../types/payable";
import Button from "../components/ui/Button";
import PayableForm from "../components/payables/PayableForm";
import PayableFilters from "../components/payables/PayableFilters";
import PayableTable from "../components/payables/PayableTable";
import { formatCurrency } from "../utils/currency";

type PayablesPageProps = {
  payables: Payable[];
  setPayables: Dispatch<SetStateAction<Payable[]>>;
  categories: string[];
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-1 truncate font-display text-lg font-extrabold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PayablesPage({
  payables,
  setPayables,
  categories,
}: PayablesPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(() =>
    new URLSearchParams(window.location.search).has("nova"),
  );
  const [editing, setEditing] = useState<Payable | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("nova")) {
      setShowForm(true);
      window.history.replaceState({}, "", "/contas");
    }
  }, []);

  const filtered = useMemo(
    () =>
      payables.filter(
        (payable) =>
          (filter === "Todas" || payable.status === filter) &&
          `${payable.description} ${payable.category}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [payables, filter, search],
  );

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(payable: Payable) {
    setEditing(payable);
    setShowForm(true);
  }

  function save(values: PayableFormValues, payableId?: number) {
    const amount = Number(values.amount.replace(",", "."));

    const status: PayableStatus =
      values.status === "Paga"
        ? "Paga"
        : values.dueDate < getTodayDate()
          ? "Vencida"
          : "Pendente";

    const normalized = {
      description: values.description.trim(),
      category: values.category,
      dueDate: values.dueDate,
      paymentDate: status === "Paga" ? values.paymentDate : undefined,
      amount,
      status,
      notes: values.notes.trim(),
    };

    if (payableId !== undefined) {
      setPayables((current) =>
        current.map((item) =>
          item.id === payableId ? { ...item, ...normalized } : item,
        ),
      );
      setNotice("Conta atualizada nesta demonstração.");
    } else {
      setPayables((current) => [
        {
          id: Math.max(0, ...current.map((item) => item.id)) + 1,
          ...normalized,
        },
        ...current,
      ]);
      setNotice("Conta adicionada nesta demonstração.");
    }
    setShowForm(false);
    setEditing(null);
  }

  function markPaid(payable: Payable) {
    //Essa função marca o pagamento e insere a data atual como data de pagamento.
    setPayables((current) =>
      current.map((item) =>
        item.id === payable.id
          ? {
              ...item,
              status: "Paga",
              paymentDate: getTodayDate(),
            }
          : item,
      ),
    );

    setNotice("Conta marcada como paga.");
  }

  function unmarkPaid(payable: Payable) {
    //Essa função remove a data de pagamento e recupera o status correto segundo o vencimento.
    const today = getTodayDate();

    const status: PayableStatus =
      payable.dueDate < today ? "Vencida" : "Pendente";

    setPayables((current) =>
      current.map((item) =>
        item.id === payable.id
          ? {
              ...item,
              status,
              paymentDate: undefined,
            }
          : item,
      ),
    );

    setNotice("Pagamento desfeito. O status da conta foi atualizado.");
  }

  function remove(payable: Payable) {
    if (window.confirm(`Excluir a conta "${payable.description}"?`)) {
      setPayables((current) =>
        current.filter((item) => item.id !== payable.id),
      );
      setNotice("Conta removida desta demonstração.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            ORGANIZE SEUS COMPROMISSOS
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Contas a pagar
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cadastre, acompanhe e atualize suas contas.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={17} /> Cadastrar conta
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat
          label="Todas as contas"
          value={String(payables.length)}
          icon={<FileText size={17} />}
        />
        <MiniStat
          label="Em aberto"
          value={String(
            payables.filter((item) => item.status === "Pendente").length,
          )}
          icon={<Clock3 size={17} />}
        />
        <MiniStat
          label="Valor em aberto"
          value={formatCurrency(
            payables
              .filter((item) => item.status !== "Paga")
              .reduce((sum, item) => sum + item.amount, 0),
          )}
          icon={<Wallet size={17} />}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <PayableFilters
          search={search}
          onSearchChange={setSearch}
          status={filter}
          onStatusChange={setFilter}
          resultCount={filtered.length}
        />
        <PayableTable
          payables={filtered}
          totalPayables={payables.length}
          onEdit={openEdit}
          onMarkPaid={markPaid}
          onUnmarkPaid={unmarkPaid}
          onRemove={remove}
        />
      </div>

      {showForm && (
        <PayableForm
          payable={editing}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}
