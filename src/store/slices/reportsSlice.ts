
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HistoricalSale {
    date: string;
    sales: number;
}

interface InventoryUsage {
    item: string;
    quantityUsed: number;
}

interface ReportsState {
    totalInventoryCost: number;
    totalRevenue: number;
    totalProfit: number;
    historicalSales: HistoricalSale[];
    inventoryUsage: InventoryUsage[];
}

const initialState: ReportsState = {
    totalInventoryCost: 0,
    totalRevenue: 0,
    totalProfit: 0,
    historicalSales: [],
    inventoryUsage: [],
};

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setReportsData(state, action: PayloadAction<ReportsState>) {
            return action.payload;
        },
        clearReportsData(state) {
            state.totalInventoryCost = 0;
            state.totalRevenue = 0;
            state.totalProfit = 0;
            state.historicalSales = [];
            state.inventoryUsage = [];
        },
    },
});

export const { setReportsData, clearReportsData } = reportsSlice.actions;

export default reportsSlice.reducer;