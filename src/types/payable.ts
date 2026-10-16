export type PayableStatus = "Pendente" | "Vencida" | "Paga";

export type Payable = {
  id: number;
  description: string;
  category: string;
  supplier: string;
  dueDate: string;
  amount: number;
  status: PayableStatus;
  notes?: string;
};

export type PayableFormValues = {
  description: string;
  category: string;
  supplier: string;
  dueDate: string;
  amount: string;
  notes: string;
};