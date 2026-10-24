import {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type FormEvent,
} from "react";
import { Blocks, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Payable } from "../types/payable";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { supabase } from "../lib/supabase";

type CategoryRecord = {
  id: number | string;
  name: string;
};

type CategoriesPageProps = {
  categories: string[];
  setCategories: Dispatch<SetStateAction<string[]>>;
  payables: Payable[];
  setPayables: Dispatch<SetStateAction<Payable[]>>;
};

export default function CategoriesPage({
  categories,
  setCategories,
  payables,
  setPayables,
}: CategoriesPageProps) {
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("type", "despesa")
        .order("name", { ascending: true });

      if (!active) return;

      if (queryError) {
        setError("Não foi possível carregar as categorias do banco.");
        return;
      }

      const records = (data ?? []) as CategoryRecord[];

      setCategoryRecords(records);
      setCategories(records.map((category) => category.name));
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [setCategories]);

  function openNew() {
    setName("");
    setEditingCategory(null);
    setError("");
    setNotice("");
    setShowModal(true);
  }

  function openEdit(category: string) {
    setName(category);
    setEditingCategory(category);
    setError("");
    setNotice("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setName("");
    setEditingCategory(null);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = name.trim().replace(/\s+/g, " ");

    if (!normalized) {
      setError("Informe o nome da categoria.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.toLocaleLowerCase("pt-BR") ===
          normalized.toLocaleLowerCase("pt-BR") && category !== editingCategory,
    );

    if (duplicate) {
      setError("Já existe uma categoria com esse nome.");
      return;
    }

    if (editingCategory !== null) {
      const record = categoryRecords.find(
        (category) => category.name === editingCategory,
      );

      if (!record) {
        setError("Não foi possível identificar a categoria no banco.");
        return;
      }

      const { error: updateError } = await supabase
        .from("categories")
        .update({
          name: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id)
        .eq("type", "despesa");

      if (updateError) {
        setError(
          updateError.code === "23505"
            ? "Já existe uma categoria com esse nome."
            : "Não foi possível atualizar a categoria no banco de dados.",
        );
        return;
      }

      setCategoryRecords((current) =>
        current.map((category) =>
          category.id === record.id
            ? { ...category, name: normalized }
            : category,
        ),
      );

      setCategories((current) =>
        current
          .map((category) =>
            category === editingCategory ? normalized : category,
          )
          .sort((a, b) => a.localeCompare(b, "pt-BR")),
      );

      setPayables((current) =>
        current.map((payable) =>
          payable.category === editingCategory
            ? { ...payable, category: normalized }
            : payable,
        ),
      );

      setNotice("Categoria atualizada com sucesso.");
    } else {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Não foi possível identificar o usuário autenticado.");
        return;
      }

      const { error: insertError } = await supabase.from("categories").insert({
        user_id: user.id,
        name: normalized,
        type: "despesa",
      });

      if (insertError) {
        setError(
          insertError.code === "23505"
            ? "Já existe uma categoria com esse nome."
            : "Não foi possível cadastrar a categoria no banco de dados.",
        );
        return;
      }

      setCategories((current) =>
        [...current, normalized].sort((a, b) => a.localeCompare(b, "pt-BR")),
      );

      setNotice("Categoria cadastrada com sucesso.");
    }

    closeModal();
  }

  async function remove(categoryName: string) {
    setError("");
    setNotice("");

    const record = categoryRecords.find(
      (category) => category.name === categoryName,
    );

    if (!record) {
      setError("Não foi possível identificar a categoria no banco.");
      return;
    }

    const hasLinkedPayables = payables.some(
      (payable) => payable.category === categoryName,
    );

    if (hasLinkedPayables) {
      setError(
        "Não é possível excluir uma categoria vinculada a contas a pagar.",
      );
      return;
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", record.id)
      .eq("type", "despesa");

    if (deleteError) {
      setError(
        deleteError.code === "23503"
          ? "Não é possível excluir esta categoria porque existem contas vinculadas a ela."
          : "Não foi possível excluir a categoria do banco de dados.",
      );
      return;
    }

    setCategoryRecords((current) =>
      current.filter((category) => category.id !== record.id),
    );

    setCategories((current) =>
      current.filter((category) => category !== categoryName),
    );

    setNotice("Categoria excluída com sucesso.");
    closeModal();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            ORGANIZE SEUS LANÇAMENTOS
          </p>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Categorias
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Crie e organize as categorias usadas no cadastro das contas.
          </p>
        </div>

        <Button onClick={openNew}>
          <Plus size={17} />
          Nova categoria
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>

          <button
            type="button"
            aria-label="Fechar erro"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              Categorias cadastradas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {categories.length} categoria(s)
            </p>
          </div>

          <Blocks className="text-emerald-700" size={22} />
        </div>

        {categories.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {categories.map((category) => {
              const linkedCount = payables.filter(
                (payable) => payable.category === category,
              ).length;

              return (
                <li
                  key={category}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div>
                    <p className="font-bold text-slate-800">{category}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {linkedCount} conta(s) vinculada(s)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openEdit(category)}
                    >
                      <Pencil size={15} />
                      Editar
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => remove(category)}
                    >
                      <Trash2 size={15} />
                      Excluir
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            Nenhuma categoria cadastrada.
          </p>
        )}
      </section>

      {showModal && (
        <Modal
          title={
            editingCategory !== null
              ? "Editar categoria"
              : "Cadastrar categoria"
          }
          eyebrow={
            editingCategory !== null ? "ATUALIZAR REGISTRO" : "NOVO REGISTRO"
          }
          description="Informe o nome da categoria."
          onClose={closeModal}
        >
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
            <Input
              label="Nome da categoria *"
              name="categoryName"
              required
              maxLength={60}
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Saúde, Educação, Assinaturas..."
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>

              <Button type="submit">
                <Check size={17} />
                {editingCategory !== null
                  ? "Salvar alterações"
                  : "Salvar categoria"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
