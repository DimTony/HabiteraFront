export interface Transaction {
  id: string;
  type: 'inflow' | 'outflow';
  source: string;
  amount: number;
  date: string;
  time: string;
  category?: string;
  method?: string;
  reference?: string;
}

export interface PaymentData {
  amount: number;
  reference: string;
}

export interface TransferData {
  type: string;
  amount: number;
  beneficiary?: {
    name: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  fee?: number;
  total?: number;
  description?: string;
  billData?: any;
  bulkPaymentData?: any;
  customerName?: string;
  fromAccount?: string;
}
