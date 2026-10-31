import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PayablesPage from "./pages/PayablesPage";
import RegisterPage from "./pages/RegisterPage";
import CategoriesPage from "./pages/CategoriesPage";
import type { Payable, PayableStatus } from "./types/payable";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { supabase } from "./lib/supabase";
import { getTodayDate } from "./utils/date";

export default function App() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  //carrega as categorias e contas do usuário autenticado ao iniciar o aplicativo
  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      const [categoriesResult, transactionsResult] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name")
          .eq("type", "despesa")
          .order("name", { ascending: true }),

        supabase
          .from("transactions")
          .select(
            "id, description, category_id, amount, due_date, status, paid_at, notes",
          )
          .eq("type", "despesa")
          .order("updated_at", { ascending: false }),
      ]);

      if (!active) return;

      if (categoriesResult.error) {
        console.error("Erro ao carregar categorias:", categoriesResult.error);
        return;
      }

      if (transactionsResult.error) {
        console.error("Erro ao carregar contas:", transactionsResult.error);
        return;
      }

      const categoriesData = categoriesResult.data ?? [];
      const transactionsData = transactionsResult.data ?? [];

      setCategories(categoriesData.map((category) => category.name));

      const categoriesById = new Map(
        categoriesData.map((category) => [Number(category.id), category.name]),
      );

      const today = getTodayDate();

      const records: Payable[] = transactionsData.map((item) => {
        const paymentDate = item.paid_at?.slice(0, 10) || undefined;

        const status: PayableStatus = paymentDate
          ? "Paga"
          : item.due_date < today
            ? "Vencida"
            : "Pendente";

        return {
          id: Number(item.id),
          description: item.description,
          category: categoriesById.get(Number(item.category_id)) ?? "",
          dueDate: item.due_date,
          paymentDate,
          amount: Number(item.amount),
          status,
          notes: item.notes ?? "",
        };
      });

      setPayables(records);
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage payables={payables} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contas"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayablesPage
                payables={payables}
                setPayables={setPayables}
                categories={categories}
                setCategories={setCategories}
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CategoriesPage
                categories={categories}
                setCategories={setCategories}
                payables={payables}
                setPayables={setPayables}
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UnderConstructionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
