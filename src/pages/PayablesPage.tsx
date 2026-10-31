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
import { supabase } from "../lib/supabase";

type PayablesPageProps = {
  payables: Payable[];
  setPayables: Dispatch<SetStateAction<Payable[]>>;
  categories: string[];
  setCategories: Dispatch<SetStateAction<string[]>>;
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
  setCategories,
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

  async function createCategory(name: string): Promise<boolean> {
    const categoryName = name.trim();

    if (!categoryName) {
      setNotice("Informe o nome da categoria.");
      return false;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Erro ao identificar usuário:", userError);
      setNotice("Não foi possível identificar o usuário.");
      return false;
    }

    // Verifica se a categoria já existe para esse usuário.
    const { data: existingCategory, error: searchError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userData.user.id)
      .eq("name", categoryName)
      .eq("type", "despesa")
      .maybeSingle();

    if (searchError) {
      console.error("Erro ao verificar categoria:", searchError);
      setNotice("Não foi possível verificar a categoria.");
      return false;
    }

    if (existingCategory) {
      setCategories((current) =>
        current.includes(existingCategory.name)
          ? current
          : [...current, existingCategory.name].sort((a, b) =>
              a.localeCompare(b),
            ),
      );

      return true;
    }

    // Cadastra a nova categoria como despesa.
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userData.user.id,
        name: categoryName,
        type: "despesa",
      })
      .select("id, name")
      .single();

    if (error || !data) {
      console.error("Erro ao cadastrar categoria:", error);
      setNotice("Não foi possível cadastrar a categoria.");
      return false;
    }

    setCategories((current) =>
      [...current, data.name].sort((a, b) => a.localeCompare(b)),
    );

    setNotice("Categoria criada com sucesso.");
    return true;
  }

  async function save(values: PayableFormValues, payableId?: number) {
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
      paymentDate:
        status === "Paga" ? values.paymentDate || getTodayDate() : undefined,
      amount,
      status,
      notes: values.notes.trim(),
    };

    // A edição integrada ao Supabase.

    if (payableId !== undefined) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", normalized.category)
        .eq("type", "despesa")
        .single();

      if (categoryError || !categoryData) {
        console.error("Erro ao localizar categoria:", categoryError);
        setNotice("Não foi possível localizar a categoria selecionada.");
        return;
      }

      const { data: updatedTransaction, error: updateError } = await supabase
        .from("transactions")
        .update({
          category_id: categoryData.id,
          description: normalized.description,
          amount: normalized.amount,
          due_date: normalized.dueDate,
          status: normalized.status.toLowerCase(),
          paid_at: normalized.paymentDate ?? null,
          notes: normalized.notes || null,
        })
        .eq("id", payableId)
        .select("updated_at")
        .single();

      if (updateError) {
        console.error("Erro ao atualizar conta:", updateError);
        setNotice("Não foi possível atualizar a conta no banco.");
        return;
      }

      if (updateError || !updatedTransaction) {
        console.error("Erro ao atualizar conta:", updateError);
        setNotice("Não foi possível atualizar a conta no banco.");
        return;
      }

      setPayables((current) => {
        const updatedPayable = {
          ...current.find((item) => item.id === payableId)!,
          ...normalized,
        };

        return [
          updatedPayable,
          ...current.filter((item) => item.id !== payableId),
        ];
      });

      setNotice("Conta atualizada com sucesso.");
      setShowForm(false);
      setEditing(null);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Erro ao identificar usuário:", userError);
      setNotice("Não foi possível identificar o usuário.");
      return;
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", normalized.category)
      .eq("type", "despesa")
      .single();

    if (categoryError || !categoryData) {
      console.error("Erro ao localizar categoria:", categoryError);
      setNotice("Não foi possível localizar a categoria selecionada.");
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userData.user.id,
        category_id: categoryData.id,
        description: normalized.description,
        type: "despesa",
        amount: normalized.amount,
        due_date: normalized.dueDate,
        status: normalized.status.toLowerCase(),
        paid_at: normalized.paymentDate ?? null,
        notes: normalized.notes || null,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Erro ao cadastrar conta:", insertError);
      setNotice("Não foi possível cadastrar a conta no banco.");
      return;
    }

    const newPayable: Payable = {
      id: Number(inserted.id),
      ...normalized,
    };

    setPayables((current) => [newPayable, ...current]);
    setNotice("Conta cadastrada com sucesso.");
    setShowForm(false);
    setEditing(null);
  }

  //Essa função marca o pagamento e insere a data atual como data de pagamento.
  async function markPaid(payable: Payable) {
    const paymentDate = getTodayDate();

    const { error } = await supabase
      .from("transactions")
      .update({
        status: "paga",
        paid_at: paymentDate,
      })
      .eq("id", payable.id);

    if (error) {
      console.error("Erro ao marcar conta como paga:", error);
      setNotice("Não foi possível registrar o pagamento no banco.");
      return;
    }

    setPayables((current) =>
      current.map((item) =>
        item.id === payable.id
          ? {
              ...item,
              status: "Paga",
              paymentDate,
            }
          : item,
      ),
    );

    setNotice("Conta marcada como paga.");
  }

  //Essa função remove a data de pagamento e recupera o status correto segundo o vencimento.

  async function unmarkPaid(payable: Payable) {
    const today = getTodayDate();

    const status: PayableStatus =
      payable.dueDate < today ? "Vencida" : "Pendente";

    const { error } = await supabase
      .from("transactions")
      .update({
        status: status.toLowerCase(),
        paid_at: null,
      })
      .eq("id", payable.id);

    if (error) {
      console.error("Erro ao desfazer pagamento:", error);
      setNotice("Não foi possível desfazer o pagamento no banco.");
      return;
    }

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

  async function remove(payable: Payable) {
    const confirmed = window.confirm(
      `Excluir a conta "${payable.description}"?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", payable.id);

    if (error) {
      console.error("Erro ao excluir conta:", error);
      setNotice("Não foi possível excluir a conta do banco.");
      return;
    }

    setPayables((current) => current.filter((item) => item.id !== payable.id));

    setNotice("Conta excluída com sucesso.");
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
          onCreateCategory={createCategory}
        />
      )}
    </div>
  );
}
