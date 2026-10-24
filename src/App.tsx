import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PayablesPage from "./pages/PayablesPage";
import RegisterPage from "./pages/RegisterPage";
import CategoriesPage from "./pages/CategoriesPage";
import { initialPayables } from "./data/mockPayables";
import type { Payable } from "./types/payable";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { supabase } from "./lib/supabase";

export default function App() {
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [categories, setCategories] = useState<string[]>([]);

  //carrega as categorias do usuário autenticado ao iniciar o aplicativo
  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("type", "despesa")
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao carregar categorias:", error);
        return;
      }

      setCategories((data ?? []).map((category) => category.name));
    }

    loadCategories();
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
