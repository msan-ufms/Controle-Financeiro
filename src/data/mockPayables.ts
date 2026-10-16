import type { Payable } from "../types/payable";

export const initialPayables: Payable[] = [
  {
    id: 1,
    description: "Aluguel do escritório",
    category: "Moradia e estrutura",
    supplier: "Imóveis Horizonte",
    dueDate: "2026-10-18",
    amount: 1850,
    status: "Pendente",
  },
  {
    id: 2,
    description: "Internet e telefone",
    category: "Serviços",
    supplier: "Conecta Telecom",
    dueDate: "2026-10-16",
    amount: 189.9,
    status: "Pendente",
  },
  {
    id: 3,
    description: "Energia elétrica",
    category: "Serviços",
    supplier: "Energia Brasil",
    dueDate: "2026-10-12",
    amount: 347.62,
    status: "Vencida",
  },
  {
    id: 4,
    description: "Licença de software",
    category: "Tecnologia",
    supplier: "Nuvem Sistemas",
    dueDate: "2026-10-22",
    amount: 129.9,
    status: "Pendente",
  },
  {
    id: 5,
    description: "Material de escritório",
    category: "Materiais",
    supplier: "Papelaria Central",
    dueDate: "2026-10-08",
    amount: 216.4,
    status: "Paga",
  },
];