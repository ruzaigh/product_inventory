// src/store/slices/salesSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Sample sales data for demonstration
const initialState = {
  sales: [
    {
      id: 'SALE-001',
      customerId: 'customer1',
      customerName: 'John Doe',
      items: [
        {
          productId: 'product-001',
          productName: 'Chocolate Cake',
          quantity: 1,
          unitPrice: 25.99,
          totalPrice: 25.99
        },
        {
          productId: 'product-002',
          productName: 'Vanilla Cupcake',
          quantity: 2,
          unitPrice: 3.99,
          totalPrice: 7.98
        }
      ],
      subtotal: 33.97,
      taxRate: 7,
      taxAmount: 2.38,
      discountPercent: 0,
      discountAmount: 0,
      totalAmount: 36.35,
      paymentMethod: 'Credit Card',
      status: 'Completed',
      createdAt: '2023-04-20T14:30:00Z',
      updatedAt: '2023-04-20T14:30:00Z'
    },
    {
      id: 'SALE-002',
      customerId: 'walk-in',
      customerName: 'Walk-in Customer',
      items: [
        {
          productId: 'product-003',
          productName: 'Bread Loaf',
          quantity: 3,
          unitPrice: 4.50,
          totalPrice: 13.50
        }
      ],
      subtotal: 13.50,
      taxRate: 7,
      taxAmount: 0.95,
      discountPercent: 0,
      discountAmount: 0,
      totalAmount: 14.45,
      paymentMethod: 'Cash',
      status: 'Completed',
      createdAt: '2023-04-20T16:45:00Z',
      updatedAt: '2023-04-20T16:45:00Z'
    }
  ],
  loading: false,
  error: null
};

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action) => {
      state.sales = action.payload;
    },
    addSale: (state, action) => {
      state.sales.push(action.payload);
    },
    updateSale: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const saleIndex = state.sales.findIndex(sale => sale.id === id);
      if (saleIndex !== -1) {
        state.sales[saleIndex] = {
          ...state.sales[saleIndex],
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteSale: (state, action) => {
      const saleIndex = state.sales.findIndex(sale => sale.id === action.payload);
      if (saleIndex !== -1) {
        // Mark as voided instead of removing
        state.sales[saleIndex].status = 'Voided';
        state.sales[saleIndex].updatedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { 
  setSales, 
  addSale, 
  updateSale, 
  deleteSale,
  setLoading, 
  setError 
} = salesSlice.actions;

export default salesSlice.reducer;