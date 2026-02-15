export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  inStock: boolean;
  stockCount: number;
  image?: string;
  dateAdded?: string;
  lastUpdated?: string;
  status?: 'active' | 'low-stock' | 'out-of-stock';
  isVatApplied?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdDate: string;
  dueDate?: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'open' | 'delivered' | 'closed';
  orderDate: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}
