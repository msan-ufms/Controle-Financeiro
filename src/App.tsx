import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PayablesPage from "./pages/PayablesPage";
import RegisterPage from "./pages/RegisterPage";
import { initialPayables } from "./data/mockPayables";
import type { Payable } from "./types/payable";
import UnderConstructionPage from "./pages/UnderConstructionPage";

export default function App() {
  const [payables, setPayables] = useState<Payable[]>(initialPayables);

  return (
    /* Neste componente ficam as rotas. O React Router compara a URL atual com as rotas cadastradas. */
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <AppLayout>
            <DashboardPage payables={payables} />
          </AppLayout>
        }
      />
      <Route
        path="/contas"
        element={
          <AppLayout>
            <PayablesPage payables={payables} setPayables={setPayables} />
          </AppLayout>
        }
      />
      <Route
        path="/categorias"
        element={
          <AppLayout>
            <UnderConstructionPage />
          </AppLayout>
        }
      />
      <Route
        path="/relatorios"
        element={
          <AppLayout>
            <UnderConstructionPage />
          </AppLayout>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
