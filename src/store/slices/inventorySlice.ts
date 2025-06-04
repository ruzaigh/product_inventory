// @TODO make like authSlice
import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface InventoryItem {
  id: string;
  name: string;
  sku?: string; // SKU seems to be optional in some parts of your code (e.g., ProductsPage)
  description?: string; // Assuming description can be optional
  quantity: number;
  unit: string;
  costPerUnit: number;
  category?: string; // Assuming category can be optional
  reorderLevel: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface InventoryState {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
}

// Sample inventory data for demonstration
const initialState: InventoryState = {
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
    setInventory: (state, action: PayloadAction<InventoryItem[]>) => {
      state.inventory = action.payload;
    },
    addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      state.inventory.push(action.payload);
    },
    // For update, it's common to receive a partial item or specific fields
    // Here, we assume a partial item with ID is passed
    updateInventoryItem: (state, action: PayloadAction<Partial<InventoryItem> & { id: string }>) => {
      const { id, ...updatedFields } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex] = {
          ...state.inventory[itemIndex],
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteInventoryItem: (state, action: PayloadAction<string>) => { // Payload is the item ID
      state.inventory = state.inventory.filter(item => item.id !== action.payload);
    },
    // Payload for changing quantity
    decreaseInventoryQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex].quantity = Math.max(0, state.inventory[itemIndex].quantity - quantity);
        state.inventory[itemIndex].updatedAt = new Date().toISOString();
      }
    },
    increaseInventoryQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.inventory[itemIndex].quantity += quantity;
        state.inventory[itemIndex].updatedAt = new Date().toISOString();
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