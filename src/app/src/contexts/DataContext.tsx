import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product, Invoice, Order } from "../types/product.types";

interface DataContextType {
  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  
  // Invoices
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  
  // Orders
  ordersData: Order[];
  setOrdersData: React.Dispatch<React.SetStateAction<Order[]>>;
  
  // Order Links
  orderLinks: any[];
  setOrderLinks: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Payroll
  payrollData: any[];
  setPayrollData: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Selected items for different screens
  selectedItemsForSell: any[];
  setSelectedItemsForSell: React.Dispatch<React.SetStateAction<any[]>>;
  
  selectedItemsForInvoice: any[];
  setSelectedItemsForInvoice: React.Dispatch<React.SetStateAction<any[]>>;
  
  selectedItemsForOrder: any[];
  setSelectedItemsForOrder: React.Dispatch<React.SetStateAction<any[]>>;
  
  selectedItemsForOrderLink: any[];
  setSelectedItemsForOrderLink: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Inventory selection mode
  inventorySelectionMode: boolean;
  setInventorySelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  
  inventoryRequestingScreen: 'sell' | 'invoice' | 'order' | 'order-link' | null;
  setInventoryRequestingScreen: React.Dispatch<React.SetStateAction<'sell' | 'invoice' | 'order' | 'order-link' | null>>;
  
  // Store state
  hasCompletedStoreSetup: boolean;
  setHasCompletedStoreSetup: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Business tools
  selectedBusinessTools: string[];
  setSelectedBusinessTools: React.Dispatch<React.SetStateAction<string[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [orderLinks, setOrderLinks] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  
  const [selectedItemsForSell, setSelectedItemsForSell] = useState<any[]>([]);
  const [selectedItemsForInvoice, setSelectedItemsForInvoice] = useState<any[]>([]);
  const [selectedItemsForOrder, setSelectedItemsForOrder] = useState<any[]>([]);
  const [selectedItemsForOrderLink, setSelectedItemsForOrderLink] = useState<any[]>([]);
  
  const [inventorySelectionMode, setInventorySelectionMode] = useState(false);
  const [inventoryRequestingScreen, setInventoryRequestingScreen] = useState<'sell' | 'invoice' | 'order' | 'order-link' | null>(null);
  
  const [hasCompletedStoreSetup, setHasCompletedStoreSetup] = useState(false);
  
  const [selectedBusinessTools, setSelectedBusinessTools] = useState<string[]>([
    'sell',
    'invoice',
    'orders',
    'expenses'
  ]);

  return (
    <DataContext.Provider
      value={{
        products,
        setProducts,
        invoices,
        setInvoices,
        ordersData,
        setOrdersData,
        orderLinks,
        setOrderLinks,
        payrollData,
        setPayrollData,
        selectedItemsForSell,
        setSelectedItemsForSell,
        selectedItemsForInvoice,
        setSelectedItemsForInvoice,
        selectedItemsForOrder,
        setSelectedItemsForOrder,
        selectedItemsForOrderLink,
        setSelectedItemsForOrderLink,
        inventorySelectionMode,
        setInventorySelectionMode,
        inventoryRequestingScreen,
        setInventoryRequestingScreen,
        hasCompletedStoreSetup,
        setHasCompletedStoreSetup,
        selectedBusinessTools,
        setSelectedBusinessTools
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
