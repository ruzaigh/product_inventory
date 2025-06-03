// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// For demonstration, we're using a mock user
// In a real application, this would be connected to a backend
const initialState = {
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
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
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

export const { login, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;