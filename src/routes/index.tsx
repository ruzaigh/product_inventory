import {FC} from 'react';
import {Routes, Route, Navigate, RouteProps} from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from "../components/Layout/MainLayout";
// Auth Pages
import LoginPage from '../pages/Auth/LoginPage';

// Main App Pages
import Dashboard from '../pages/Dashboard';
import InventoryPage from '../pages/Inventory/InventoryPage';
import AddInventoryItem from '../pages/Inventory/AddInventoryItem';
import ProductsPage from '../pages/Products/ProductsPage';
import AddProductPage from '../pages/Products/AddProductPage';
import SalesPage from '../pages/Sales/SalesPage';
import NewSalePage from '../pages/Sales/NewSalePage';
import ReceiptPage from '../pages/Sales/ReceiptPage';
import { RootState } from '../store';


// Auth Guard - Redirects to login if not authenticated
const PrivateRoute: FC<RouteProps> = ({ children }) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route - Redirects to dashboard if already authenticated
const PublicRoute: FC<RouteProps> = ({ children }) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected Routes - MainLayout */}
            <Route
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Inventory Management */}
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/add" element={<AddInventoryItem />} />

                {/* Product Management */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/add" element={<AddProductPage />} />

                {/* Sales Management */}
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/new" element={<NewSalePage />} />
                <Route path="/sales/receipt/:id" element={<ReceiptPage />} />
            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;