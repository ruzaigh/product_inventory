// src/store/slices/productSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Sample product data for demonstration
const initialState = {
  products: [
    {
      id: 'product-001',
      name: 'Chocolate Cake',
      sku: 'CK-001',
      description: 'Delicious chocolate cake',
      sellingPrice: 25.99,
      productionCost: 8.75,
      quantity: 10,
      isActive: true,
      materials: [
        { inventoryItemId: 'inv-001', quantity: 0.5 }, // Flour
        { inventoryItemId: 'inv-002', quantity: 0.3 }, // Sugar
        { inventoryItemId: 'inv-003', quantity: 0.2 }, // Butter
        { inventoryItemId: 'inv-004', quantity: 4 }    // Eggs
      ],
      createdAt: '2023-04-16T09:30:00Z',
      updatedAt: '2023-04-16T09:30:00Z'
    },
    {
      id: 'product-002',
      name: 'Vanilla Cupcake',
      sku: 'CP-001',
      description: 'Sweet vanilla cupcake with frosting',
      sellingPrice: 3.99,
      productionCost: 1.25,
      quantity: 24,
      isActive: true,
      materials: [
        { inventoryItemId: 'inv-001', quantity: 0.1 }, // Flour
        { inventoryItemId: 'inv-002', quantity: 0.08 }, // Sugar
        { inventoryItemId: 'inv-003', quantity: 0.05 }, // Butter
        { inventoryItemId: 'inv-004', quantity: 1 }    // Eggs
      ],
      createdAt: '2023-04-16T09:45:00Z',
      updatedAt: '2023-04-16T09:45:00Z'
    },
    {
      id: 'product-003',
      name: 'Bread Loaf',
      sku: 'BL-001',
      description: 'Freshly baked bread loaf',
      sellingPrice: 4.50,
      productionCost: 1.80,
      quantity: 15,
      isActive: true,
      materials: [
        { inventoryItemId: 'inv-001', quantity: 0.5 }, // Flour
        { inventoryItemId: 'inv-002', quantity: 0.05 }, // Sugar
        { inventoryItemId: 'inv-003', quantity: 0.1 }  // Butter
      ],
      createdAt: '2023-04-16T10:00:00Z',
      updatedAt: '2023-04-16T10:00:00Z'
    }
  ],
  loading: false,
  error: null
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        state.products[productIndex] = {
          ...state.products[productIndex],
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(product => product.id !== action.payload);
    },
    decreaseProductQuantity: (state, action) => {
      // Used when products are sold
      const { id, quantity } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        state.products[productIndex].quantity = Math.max(0, state.products[productIndex].quantity - quantity);
        state.products[productIndex].updatedAt = new Date().toISOString();
      }
    },
    increaseProductQuantity: (state, action) => {
      // Used when products are manufactured
      const { id, quantity } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        state.products[productIndex].quantity += quantity;
        state.products[productIndex].updatedAt = new Date().toISOString();
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
  setProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  decreaseProductQuantity,
  increaseProductQuantity,
  setLoading, 
  setError 
} = productSlice.actions;

export default productSlice.reducer;