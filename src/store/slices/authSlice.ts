import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// For demonstration, we're using a mock user
// In a real application, this would be connected to a backend
const initialState: AuthState = {
  isAuthenticated: true, // Auto logged in for demo purposes
  user: {
    id: 'user1',
    username: 'demo',
    fullName: 'Demo User',
    email: 'demo@example.com',
    role: 'admin'
  },
  loading: false,
  error: null
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Type the action payload for the login reducer
    login: (state, action: PayloadAction<User> ) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    // Type the action payload for setLoading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Type the action payload for setError
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false; // Error usually implies loading has finished
    },
  }
});

export const { login, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;