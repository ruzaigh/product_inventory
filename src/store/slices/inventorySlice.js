// src/store/slices/inventorySlice.js
import { createSlice } from '@reduxjs/toolkit';

// Sample inventory data for demonstration
const initialState = {
  inventory: [
    {
      id: 'inv-001',
      name: 'Flour',
      sku: 'FL-001',
      description: 'All-purpose flour',
      quantity: 50,
      unit: 'kg',
      costPerUnit: 0.80,
      category: 'Ingredients',
      reorderLevel: 10,
      createdAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-04-15T10:30:00Z'
    },
    {
      id: 'inv-002',
      name: 'Sugar',
      sku: 'SG-001',
      description: 'White granulated sugar',
      quantity: 30,
      unit: 'kg',
      costPerUnit: 1.20,
      category: 'Ingredients',
      reorderLevel: 5,
      createdAt: '2023-04-15T10:35:00Z',
      updatedAt: '2023-04-15T10:35:00Z'
    },
    {
      id: 'inv-003',
      name: 'Butter',
      sku: 'BT-001',
      description: 'Unsalted butter',
      quantity: 20,
      unit: 'kg',
      costPerUnit: 4.50,
      category: 'Ingredients',
      reorderLevel: 8,
      createdAt: '2023-04-15T10:40:00Z',
      updatedAt: '2023-04-15T10:40:00Z'
    },
    {
      id: 'inv-004',
      name: 'Eggs',
      sku: 'EG-001',
      description: 'Large eggs',
      quantity: 100,
      unit: 'pcs',
      costPerUnit: 0.20,
      category: 'Ingredients',
      reorderLevel: 24,
      createdAt: '2023-04-15T10:45:00Z',
      updatedAt: '2023-04-15T10:45:00Z'
    },
    {
      id: 'inv-005',
      name: 'Packaging Box',
      sku: 'PK-001',
      description: 'Small cake box',
      quantity: 200,
      unit: 'pcs',
      costPerUnit: 0.30,
      category: 'Packaging',
      reorderLevel: 50,
      createdAt: '2023-04-15T11:00:00Z',
      updatedAt: '2023-04-15T11:00:00Z'
    }
  ],
  loading: false,
  error: null
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    addInventoryItem: (state, action) => {
      state.inventory.push(action.payload);
    },
    updateInventoryItem: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex] = {
          ...state.inventory[itemIndex],
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteInventoryItem: (state, action) => {
      state.inventory = state.inventory.filter(item => item.id !== action.payload);
    },
    decreaseInventoryQuantity: (state, action) => {
      // Used when products are created or sold
      const { id, quantity } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex].quantity = Math.max(0, state.inventory[itemIndex].quantity - quantity);
        state.inventory[itemIndex].updatedAt = new Date().toISOString();
      }
    },
    increaseInventoryQuantity: (state, action) => {
      // Used when inventory is restocked
      const { id, quantity } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex].quantity += quantity;
        state.inventory[itemIndex].updatedAt = new Date().toISOString();
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
  setInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  decreaseInventoryQuantity,
  increaseInventoryQuantity,
  setLoading, 
  setError 
} = inventorySlice.actions;

export default inventorySlice.reducer;