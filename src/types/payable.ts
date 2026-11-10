export type PayableStatus = "Pendente" | "Vencida" | "Paga";

// Tipos de agrupamento de contas
export type TransactionGroupType = "parcelamento" | "repeticao";
// Formas de cálculo do valor das parcelas
export type InstallmentAmountMode = "dividir_total" | "repetir_valor";

export type PayableRegistrationMode = "normal" | "parcelar" | "repetir";

export type CustomAmountPosition = "nenhuma" | "primeira" | "ultima";

export type RemainderDistribution = "primeiras" | "ultimas";

export type RepetitionMode = "uma_vez" | "quantidade_definida";

export type Payable = {
  id: number;
  description: string;
  category: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  status: PayableStatus;
  notes?: string;
  // Informações do grupo, quando a conta fizer parte de um
  groupId?: number | null;
  groupPosition?: number | null;
  groupType?: TransactionGroupType | null;
  groupItemCount?: number | null;
  amountMode?: InstallmentAmountMode | null;
};

export type PayableFormValues = {
  description: string;
  category: string;
  dueDate: string;
  paymentDate: string;
  amount: string;
  status: PayableStatus;
  notes: string;
  registrationMode: PayableRegistrationMode;

  // Configurações de parcelamento
  installmentAmountMode: InstallmentAmountMode;
  installmentCount: string;
  customAmountPosition: CustomAmountPosition;
  customAmount: string;
  remainderDistribution: RemainderDistribution;

  // Configurações de repetição
  repetitionMode: RepetitionMode;
  repetitionCount: string;
};
