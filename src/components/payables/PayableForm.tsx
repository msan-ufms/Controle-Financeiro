import { useEffect, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import type {
  Payable,
  PayableFormValues,
  PayableStatus,
} from "../../types/payable";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";

const emptyForm: PayableFormValues = {
  description: "",
  category: "",
  dueDate: new Date().toISOString().slice(0, 10),
  amount: "",
  status: "Pendente",
  notes: "",
};

type PayableFormProps = {
  payable: Payable | null;
  categories: string[];
  onClose: () => void;
  onSave: (values: PayableFormValues, payableId?: number) => void;
};

const statusOptions: { label: string; value: PayableStatus }[] = [
  { label: "Pendente", value: "Pendente" },
  { label: "Vencida", value: "Vencida" },
  { label: "Paga", value: "Paga" },
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusByDueDate(
  dueDate: string,
  currentStatus: PayableStatus,
): PayableStatus {
  // Uma conta paga permanece paga, independentemente do vencimento.
  if (currentStatus === "Paga") {
    return "Paga";
  }

  return dueDate < getTodayDate() ? "Vencida" : "Pendente";
}

export default function PayableForm({
  payable,
  categories,
  onClose,
  onSave,
}: PayableFormProps) {
  const [form, setForm] = useState<PayableFormValues>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (payable) {
      setForm({
        description: payable.description,
        category: payable.category,
        dueDate: payable.dueDate,
        amount: String(payable.amount),
        status: payable.status,
        notes: payable.notes ?? "",
      });
    } else {
      setForm({ ...emptyForm, category: categories[0] ?? "" });
    }
    setError("");
  }, [payable, categories]);

  function update<K extends keyof PayableFormValues>(
    key: K,
    value: PayableFormValues[K],
  ) {
    setForm((current) => {
      const updated = { ...current, [key]: value };

      if (key === "dueDate" && current.status !== "Paga") {
        updated.status = getStatusByDueDate(String(value), current.status);
      }

      if (key === "status") {
        updated.status = value as PayableFormValues["status"];
      }

      return updated;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const today = getTodayDate();
    const amount = Number(form.amount.replace(",", "."));

    if (form.status === "Vencida" && form.dueDate >= today) {
      setError(
        "Não é possível cadastrar uma conta vencida com vencimento hoje ou em uma data futura.",
      );
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!form.description.trim()) {
      setError("Informe a descrição da conta.");
      return;
    }
    if (!form.category || !categories.includes(form.category)) {
      setError("Selecione uma categoria válida.");
      return;
    }
    const finalStatus =
      form.status === "Paga"
        ? "Paga"
        : getStatusByDueDate(form.dueDate, form.status);

    onSave(
      { ...form, amount: String(amount), status: finalStatus },
      payable?.id,
    );
  }

  return (
    <Modal
      title={payable ? "Editar conta" : "Cadastrar conta a pagar"}
      eyebrow={payable ? "ATUALIZAR REGISTRO" : "NOVO REGISTRO"}
      description="Preencha os dados principais da conta."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Descrição da conta *"
              name="description"
              required
              maxLength={100}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Ex.: Conta de internet, aluguel..."
            />
          </div>
          <Input
            label="Valor (R$) *"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(event) => update("amount", event.target.value)}
            placeholder="0,00"
          />
          <Input
            label="Data de vencimento *"
            name="dueDate"
            type="date"
            required
            value={form.dueDate}
            onChange={(event) => update("dueDate", event.target.value)}
          />
          <Select
            label="Categoria *"
            name="category"
            required
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            options={categories.map((category) => ({
              label: category,
              value: category,
            }))}
          />
          <Select
            label="Status da conta *"
            name="status"
            required
            value={form.status}
            onChange={(event) =>
              update("status", event.target.value as PayableStatus)
            }
            options={statusOptions}
          />
          <div className="sm:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Observações{" "}
                <span className="font-normal text-slate-400">(opcional)</span>
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Alguma informação adicional sobre esta conta..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
          </div>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            <Check size={17} /> {payable ? "Salvar alterações" : "Salvar conta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
