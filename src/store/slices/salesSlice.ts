// src/store/slices/salesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface for items within a sale
export interface SaleItem {
  productId: string;
  productName: string; // Name of the product at the time of sale
  quantity: number;
  unitPrice: number; // Price per unit at the time of sale
  totalPrice: number; // quantity * unitPrice
}

// Interface for a single sale record
export interface Sale {
  id: string;
  customerId: string; // Could be 'walk-in' or an actual customer ID
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number; // e.g., 7 for 7%
  taxAmount: number;
  discountPercent?: number; // Optional: e.g., 10 for 10%
  discountAmount?: number; // Optional
  totalAmount: number;
  paymentMethod: string;
  status: "Completed" | "Voided" | "Pending" | string; // More specific statuses or just string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Interface for the sales slice state
export interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [
    {
      id: "SALE-001",
      customerId: "customer1",
      customerName: "John Doe",
      items: [
        {
          productId: "product-001",
          productName: "Chocolate Cake",
          quantity: 1,
          unitPrice: 25.99,
          totalPrice: 25.99,
        },
        {
          productId: "product-002",
          productName: "Vanilla Cupcake",
          quantity: 2,
          unitPrice: 3.99,
          totalPrice: 7.98,
        },
      ],
      subtotal: 33.97,
      taxRate: 7,
      taxAmount: 2.38,
      discountPercent: 0, // Make sure this matches the optional nature in the interface if needed
      discountAmount: 0, // Make sure this matches the optional nature in the interface if needed
      totalAmount: 36.35,
      paymentMethod: "Credit Card",
      status: "Completed",
      createdAt: "2023-04-20T14:30:00Z",
      updatedAt: "2023-04-20T14:30:00Z",
    },
    {
      id: "SALE-002",
      customerId: "walk-in",
      customerName: "Walk-in Customer",
      items: [
        {
          productId: "product-003",
          productName: "Bread Loaf",
          quantity: 3,
          unitPrice: 4.5,
          totalPrice: 13.5,
        },
      ],
      subtotal: 13.5,
      taxRate: 7,
      taxAmount: 0.95,
      discountPercent: 0,
      discountAmount: 0,
      totalAmount: 14.45,
      paymentMethod: "Cash",
      status: "Completed",
      createdAt: "2023-04-20T16:45:00Z",
      updatedAt: "2023-04-20T16:45:00Z",
    },
  ],
  loading: false,
  error: null,
};

export const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload;
    },
    addSale: (state, action: PayloadAction<Sale>) => {
      // In a real app, you might also want to update product quantities here or via a thunk
      state.sales.push(action.payload);
    },
    updateSale: (
      state,
      action: PayloadAction<Partial<Sale> & { id: string }>,
    ) => {
      const { id, ...updatedFields } = action.payload;
      const saleIndex = state.sales.findIndex((sale) => sale.id === id);
      if (saleIndex !== -1) {
        state.sales[saleIndex] = {
          ...state.sales[saleIndex],
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteSale: (state, action: PayloadAction<string>) => {
      // Payload is sale ID
      const saleIndex = state.sales.findIndex(
        (sale) => sale.id === action.payload,
      );
      if (saleIndex !== -1) {
        state.sales[saleIndex].status = "Voided"; // Mark as voided
        state.sales[saleIndex].updatedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setSales,
  addSale,
  updateSale,
  deleteSale,
  setLoading,
  setError,
} = salesSlice.actions;

export default salesSlice.reducer;
