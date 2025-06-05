import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CustomerType = 'regular' | 'vip' | 'wholesale' | 'walk-in';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    customerType: CustomerType;
    totalPurchases: number;
    totalSpent: number;
    lastPurchaseDate: string | null;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerState {
    customers: Customer[];
    loading: boolean;
    error: string | null;
}

export interface UpdateCustomerPurchaseStatsPayload {
    customerId: string;
    purchaseAmount: number;
}

// Sample customer data for demonstration
const initialState: CustomerState = {
    customers: [
        {
            id: 'walk-in',
            name: 'Walk-in Customer',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            customerType: 'walk-in',
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchaseDate: null,
            notes: '',
            isActive: true,
            createdAt: '2023-04-15T10:30:00Z',
            updatedAt: '2023-04-15T10:30:00Z'
        },
        {
            id: 'customer1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '(555) 123-4567',
            address: '123 Main Street',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            customerType: 'regular',
            totalPurchases: 5,
            totalSpent: 234.75,
            lastPurchaseDate: '2023-04-20T14:30:00Z',
            notes: 'Preferred customer - likes discounts',
            isActive: true,
            createdAt: '2023-03-15T10:30:00Z',
            updatedAt: '2023-04-20T14:30:00Z'
        },
        {
            id: 'customer2',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '(555) 987-6543',
            address: '456 Oak Avenue',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62702',
            customerType: 'vip',
            totalPurchases: 12,
            totalSpent: 1250.00,
            lastPurchaseDate: '2023-04-18T16:45:00Z',
            notes: 'VIP customer - always pays on time',
            isActive: true,
            createdAt: '2023-02-10T09:15:00Z',
            updatedAt: '2023-04-18T16:45:00Z'
        },
        {
            id: 'customer3',
            name: 'Bob Johnson',
            email: 'bob.johnson@email.com',
            phone: '(555) 456-7890',
            address: '789 Pine Road',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62703',
            customerType: 'regular',
            totalPurchases: 3,
            totalSpent: 89.50,
            lastPurchaseDate: '2023-04-10T11:20:00Z',
            notes: '',
            isActive: true,
            createdAt: '2023-04-01T14:22:00Z',
            updatedAt: '2023-04-10T11:20:00Z'
        }
    ],
    loading: false,
    error: null
};

export const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setCustomers: (state, action: PayloadAction<Customer[]>) => {
            state.customers = action.payload;
        },
        addCustomer: (state, action: PayloadAction<Customer>) => {
            state.customers.push(action.payload);
        },
        updateCustomer: (state, action: PayloadAction<Partial<Customer> & { id: string }>) => {
            const { id, ...updatedFields } = action.payload;
            const customerIndex = state.customers.findIndex(customer => customer.id === id);
            if (customerIndex !== -1) {
                state.customers[customerIndex] = {
                    ...state.customers[customerIndex],
                    ...updatedFields,
                    updatedAt: new Date().toISOString()
                };
            }
        },
        deleteCustomer: (state, action: PayloadAction<string>) => {
            state.customers = state.customers.filter(customer => customer.id !== action.payload);
        },
        updateCustomerPurchaseStats: (state, action: PayloadAction<UpdateCustomerPurchaseStatsPayload>) => {
            // Used when a sale is made to update customer statistics
            const { customerId, purchaseAmount } = action.payload;
            const customerIndex = state.customers.findIndex(customer => customer.id === customerId);
            if (customerIndex !== -1) {
                state.customers[customerIndex].totalPurchases += 1;
                state.customers[customerIndex].totalSpent += purchaseAmount;
                state.customers[customerIndex].lastPurchaseDate = new Date().toISOString();
                state.customers[customerIndex].updatedAt = new Date().toISOString();
            }
        },
        toggleCustomerStatus: (state, action: PayloadAction<string>) => {
            const customerIndex = state.customers.findIndex(customer => customer.id === action.payload);
            if (customerIndex !== -1) {
                state.customers[customerIndex].isActive = !state.customers[customerIndex].isActive;
                state.customers[customerIndex].updatedAt = new Date().toISOString();
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const {
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerPurchaseStats,
    toggleCustomerStatus,
    setLoading,
    setError
} = customerSlice.actions;

export default customerSlice.reducer;