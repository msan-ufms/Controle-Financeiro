import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PayablesPage from "./pages/PayablesPage";
import RegisterPage from "./pages/RegisterPage";
import CategoriesPage from "./pages/CategoriesPage";
import { initialPayables } from "./data/mockPayables";
import { initialCategories } from "./data/categories";
import type { Payable } from "./types/payable";
import UnderConstructionPage from "./pages/UnderConstructionPage";

export default function App() {
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/" element={<AppLayout><DashboardPage payables={payables} /></AppLayout>} />
      <Route path="/contas" element={<AppLayout><PayablesPage payables={payables} setPayables={setPayables} categories={categories} /></AppLayout>} />
      <Route path="/categorias" element={<AppLayout><CategoriesPage categories={categories} setCategories={setCategories} payables={payables} setPayables={setPayables} /></AppLayout>} />
      <Route path="/relatorios" element={<AppLayout><UnderConstructionPage /></AppLayout>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
