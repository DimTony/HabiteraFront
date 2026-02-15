import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { StaffData } from '../types/user.types';
import type {
  Transaction,
  PaymentData,
  TransferData,
} from "../types/transaction.types";

interface UIContextType {
  // Splash screen
  showSplash: boolean;
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Modals
  showBusinessToolsModal: boolean;
  setShowBusinessToolsModal: React.Dispatch<React.SetStateAction<boolean>>;
  
  showTransferAuthModal: boolean;
  setShowTransferAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Selected items for detail views
  selectedTransaction: Transaction | null;
  setSelectedTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
  
  selectedStaff: StaffData | null;
  setSelectedStaff: React.Dispatch<React.SetStateAction<StaffData | null>>;
  
  selectedCustomer: any;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<any>>;
  
  selectedStore: any;
  setSelectedStore: React.Dispatch<React.SetStateAction<any>>;
  
  selectedProductForDetail: any;
  setSelectedProductForDetail: React.Dispatch<React.SetStateAction<any>>;
  
  selectedOrderForDetail: any;
  setSelectedOrderForDetail: React.Dispatch<React.SetStateAction<any>>;
  
  selectedBeneficiaryForTransfer: any;
  setSelectedBeneficiaryForTransfer: React.Dispatch<React.SetStateAction<any>>;
  
  // Payment and success screens data
  paymentData: PaymentData | null;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentData | null>>;
  
  invoiceSuccessData: any;
  setInvoiceSuccessData: React.Dispatch<React.SetStateAction<any>>;
  
  orderSuccessData: any;
  setOrderSuccessData: React.Dispatch<React.SetStateAction<any>>;
  
  orderLinkSuccessData: any;
  setOrderLinkSuccessData: React.Dispatch<React.SetStateAction<any>>;
  
  orderCreatedSuccessData: any;
  setOrderCreatedSuccessData: React.Dispatch<React.SetStateAction<any>>;
  
  celebratoryReceiptData: any;
  setCelebratoryReceiptData: React.Dispatch<React.SetStateAction<any>>;
  
  // Transfer data
  transferData: TransferData | null;
  setTransferData: React.Dispatch<React.SetStateAction<TransferData | null>>;
  
  // Upgrade flow
  upgradeFlowData: any;
  setUpgradeFlowData: React.Dispatch<React.SetStateAction<any>>;
  
  // Selected payment account
  selectedPaymentAccount: string;
  setSelectedPaymentAccount: React.Dispatch<React.SetStateAction<string>>;
  
  // Transaction refresh key
  transactionRefreshKey: number;
  setTransactionRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  
  // Orders initial tab
  ordersInitialTab: 'open' | 'delivered' | 'closed' | 'links';
  setOrdersInitialTab: React.Dispatch<React.SetStateAction<'open' | 'delivered' | 'closed' | 'links'>>;
  
  // Selected cart items
  selectedCartItems: any[];
  setSelectedCartItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [showBusinessToolsModal, setShowBusinessToolsModal] = useState(false);
  const [showTransferAuthModal, setShowTransferAuthModal] = useState(false);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any>(null);
  const [selectedBeneficiaryForTransfer, setSelectedBeneficiaryForTransfer] = useState<any>(null);
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [invoiceSuccessData, setInvoiceSuccessData] = useState<any>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);
  const [orderLinkSuccessData, setOrderLinkSuccessData] = useState<any>(null);
  const [orderCreatedSuccessData, setOrderCreatedSuccessData] = useState<any>(null);
  const [celebratoryReceiptData, setCelebratoryReceiptData] = useState<any>(null);
  
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [upgradeFlowData, setUpgradeFlowData] = useState<any>(null);
  
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<string>('main');
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0);
  const [ordersInitialTab, setOrdersInitialTab] = useState<'open' | 'delivered' | 'closed' | 'links'>('open');
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([]);

  return (
    <UIContext.Provider
      value={{
        showSplash,
        setShowSplash,
        showBusinessToolsModal,
        setShowBusinessToolsModal,
        showTransferAuthModal,
        setShowTransferAuthModal,
        selectedTransaction,
        setSelectedTransaction,
        selectedStaff,
        setSelectedStaff,
        selectedCustomer,
        setSelectedCustomer,
        selectedStore,
        setSelectedStore,
        selectedProductForDetail,
        setSelectedProductForDetail,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        selectedBeneficiaryForTransfer,
        setSelectedBeneficiaryForTransfer,
        paymentData,
        setPaymentData,
        invoiceSuccessData,
        setInvoiceSuccessData,
        orderSuccessData,
        setOrderSuccessData,
        orderLinkSuccessData,
        setOrderLinkSuccessData,
        orderCreatedSuccessData,
        setOrderCreatedSuccessData,
        celebratoryReceiptData,
        setCelebratoryReceiptData,
        transferData,
        setTransferData,
        upgradeFlowData,
        setUpgradeFlowData,
        selectedPaymentAccount,
        setSelectedPaymentAccount,
        transactionRefreshKey,
        setTransactionRefreshKey,
        ordersInitialTab,
        setOrdersInitialTab,
        selectedCartItems,
        setSelectedCartItems
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
