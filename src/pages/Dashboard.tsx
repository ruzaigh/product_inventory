import { FC, ReactNode, useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../store";
import { InventoryItem } from '../store/slices/inventorySlice';
import { Product } from '../store/slices/productSlice';
import { Sale } from '../store/slices/salesSlice';
import { Customer } from '../store/slices/customerSlice';

// Types and Interfaces (same as before)
interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    linkTo: string;
    color: string;
}

interface TopProduct extends Product {
    totalSold: number;
}

interface TopCustomer extends Customer {}

interface InventoryValueData {
    name: string;
    value: number;
    quantity: number;
}

interface CategoryValueData {
    name: string;
    value: number;
    color: string;
}

interface LowStockAlertProps {
    items: InventoryItem[];
}

interface RecentSalesProps {
    sales: Sale[];
}

interface InventoryValueChartProps {
    totalValue: string;
    chartData: {
        topInventoryItems: InventoryValueData[];
        categoryData: CategoryValueData[];
    };
}

interface TopProductsProps {
    products: TopProduct[];
}

interface TopCustomersProps {
    customers: TopCustomer[];
}

// Constants
const CHART_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
];

// Utility Functions
const getCustomerTypeColor = (type: string): string => {
    switch (type) {
        case 'vip': return 'bg-purple-100 text-purple-800';
        case 'regular': return 'bg-blue-100 text-blue-800';
        case 'wholesale': return 'bg-green-100 text-green-800';
        case 'walk-in': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Simple Bar Chart Component
const SimpleBarChart: FC<{ data: InventoryValueData[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="space-y-2">
            {data.slice(0, 8).map((item, index) => {
                const percentage = (item.value / maxValue) * 100;
                return (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="w-20 text-xs text-gray-600 truncate" title={item.name}>
                            {item.name}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                            <div
                                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                ${item.value.toFixed(0)}
              </span>
                        </div>
                        <div className="w-12 text-xs text-gray-500">
                            {item.quantity}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Simple Pie Chart Component
const SimplePieChart: FC<{ data: CategoryValueData[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-2">
            {data.map((item, index) => {
                const percentage = ((item.value / total) * 100);
                return (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold">${item.value.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Dashboard Card Component
const DashboardCard: FC<DashboardCardProps> = ({ title, value, icon, linkTo, color }) => (
    <Link
        to={linkTo}
        className={`block p-6 rounded-lg shadow-md ${color} text-white transition-transform hover:scale-105`}
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="text-white text-opacity-80">{icon}</div>
        </div>
    </Link>
);

// Dashboard Cards Grid Component
const DashboardCards: FC = () => {
    const { inventory } = useSelector((state: RootState) => state.inventory);
    const { products } = useSelector((state: RootState) => state.products);
    const { sales } = useSelector((state: RootState) => state.sales);
    const { customers } = useSelector((state: RootState) => state.customers);

    const totalRevenue = sales.reduce((total, sale: Sale) => total + sale.totalAmount, 0).toFixed(2);
    const activeCustomers = customers.filter(
        (customer: Customer) => customer.isActive && customer.id !== 'walk-in'
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <DashboardCard
                title="Inventory Items"
                value={inventory.length}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                }
                linkTo="/inventory"
                color="bg-blue-600"
            />

            <DashboardCard
                title="Products"
                value={products.length}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                }
                linkTo="/products"
                color="bg-green-600"
            />

            <DashboardCard
                title="Customers"
                value={activeCustomers}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                }
                linkTo="/customers"
                color="bg-indigo-600"
            />

            <DashboardCard
                title="Sales"
                value={sales.length}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                }
                linkTo="/sales"
                color="bg-purple-600"
            />

            <DashboardCard
                title="Revenue"
                value={`$${totalRevenue}`}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                linkTo="/reports"
                color="bg-yellow-600"
            />
        </div>
    );
};

// Low Stock Alert Component
const LowStockAlert: FC<LowStockAlertProps> = ({ items }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Low Stock Alert</h2>
        {items.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b border-gray-200 text-left">Name</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-right">Quantity</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-right">Reorder Level</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b border-gray-200">{item.name}</td>
                            <td className="py-2 px-4 border-b border-gray-200 text-right">
                                <span className="text-red-600 font-medium">{item.quantity}</span>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-right">{item.reorderLevel}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-500">No low stock items found.</p>
        )}
    </div>
);

// Recent Sales Component
const RecentSales: FC<RecentSalesProps> = ({ sales }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
        {sales.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b border-gray-200 text-left">Sale ID</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-left">Date</th>
                        <th className="py-2 px-4 border-b border-gray-200 text-right">Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b border-gray-200">{sale.id}</td>
                            <td className="py-2 px-4 border-b border-gray-200">
                                {new Date(sale.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-right">
                                ${sale.totalAmount.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-500">No recent sales found.</p>
        )}
    </div>
);

// Simple Inventory Value Chart Component (No Recharts)
const InventoryValueChart: FC<InventoryValueChartProps> = ({ totalValue, chartData }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Inventory Value: ${totalValue}</h2>

        {chartData.topInventoryItems.length > 0 ? (
            <div className="space-y-6">
                {/* Top Items Bar Chart */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Top Items by Value</h3>
                    <SimpleBarChart data={chartData.topInventoryItems} />
                </div>

                {/* Category Breakdown */}
                {chartData.categoryData.length > 1 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Value by Category</h3>
                        <SimplePieChart data={chartData.categoryData} />
                    </div>
                )}
            </div>
        ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">No inventory data available</p>
            </div>
        )}
    </div>
);

// Top Products Component
const TopProducts: FC<TopProductsProps> = ({ products }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        {products.length > 0 ? (
            <div className="space-y-4">
                {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                            <span className="font-semibold">{product.totalSold}</span>
                            <span className="text-gray-500"> units</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No sales data available.</p>
        )}
    </div>
);

// Top Customers Component
const TopCustomers: FC<TopCustomersProps> = ({ customers }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
        {customers.length > 0 ? (
            <div className="space-y-4">
                {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">{customer.name}</h3>
                            <p className="text-gray-500 text-sm">{customer.totalPurchases} purchases</p>
                        </div>
                        <div className="text-right">
                            <span className="font-semibold">${customer.totalSpent.toFixed(2)}</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.customerType)}`}>
                {customer.customerType.toUpperCase()}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No customer sales data available.</p>
        )}
    </div>
);

// Main Dashboard Component
const Dashboard: FC = () => {
    const { inventory } = useSelector((state: RootState) => state.inventory);
    const { products } = useSelector((state: RootState) => state.products);
    const { sales } = useSelector((state: RootState) => state.sales);
    const { customers } = useSelector((state: RootState) => state.customers);

    const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

    // Calculate total inventory value
    const totalInventoryValue = inventory
        .reduce((total, item: InventoryItem) => total + item.quantity * item.costPerUnit, 0)
        .toFixed(2);

    // Prepare chart data using useMemo for performance
    const inventoryChartData = useMemo(() => {
        const topInventoryItems: InventoryValueData[] = inventory
            .map((item: InventoryItem) => ({
                name: item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name,
                value: item.quantity * item.costPerUnit,
                quantity: item.quantity
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const categoryTotals: { [key: string]: number } = {};
        inventory.forEach((item: InventoryItem) => {
            const category = item.category || 'Uncategorized';
            const value = item.quantity * item.costPerUnit;
            categoryTotals[category] = (categoryTotals[category] || 0) + value;
        });

        const categoryData: CategoryValueData[] = Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                color: CHART_COLORS[index % CHART_COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);

        return { topInventoryItems, categoryData };
    }, [inventory]);

    useEffect(() => {
        // Find inventory items that are below reorder level
        const lowStock = inventory.filter((item: InventoryItem) => item.quantity <= item.reorderLevel);
        setLowStockItems(lowStock);

        // Get 5 most recent sales
        const recent = [...sales]
            .sort((a: Sale, b: Sale) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
        setRecentSales(recent);

        // Get top selling products
        const productSales: { [productId: string]: number } = {};
        sales.forEach((sale: Sale) => {
            sale.items.forEach((item) => {
                if (productSales[item.productId]) {
                    productSales[item.productId] += item.quantity;
                } else {
                    productSales[item.productId] = item.quantity;
                }
            });
        });

        const topProductsList: TopProduct[] = Object.keys(productSales)
            .map((productId): TopProduct | null => {
                const product = products.find((p: Product) => p.id === productId);
                if (!product) return null;
                return { ...product, totalSold: productSales[productId] };
            })
            .filter((product): product is TopProduct => product !== null)
            .sort((a: TopProduct, b: TopProduct) => b.totalSold - a.totalSold)
            .slice(0, 5);

        setTopProducts(topProductsList);

        // Get top customers by total spent (excluding walk-in)
        const topCustomersList: TopCustomer[] = customers
            .filter((customer: Customer) => customer.id !== 'walk-in' && customer.totalSpent > 0)
            .sort((a: Customer, b: Customer) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        setTopCustomers(topCustomersList);
    }, [inventory, sales, products, customers]);

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <DashboardCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockAlert items={lowStockItems} />
                <RecentSales sales={recentSales} />
                <InventoryValueChart totalValue={totalInventoryValue} chartData={inventoryChartData} />
                <TopProducts products={topProducts} />
                <TopCustomers customers={topCustomers} />
            </div>
        </div>
    );
};

export default Dashboard;