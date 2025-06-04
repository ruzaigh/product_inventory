import { FC, ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../store";
import { InventoryItem } from '../store/slices/inventorySlice';
import { Product } from '../store/slices/productSlice';
import { Sale } from '../store/slices/salesSlice';
interface DashboardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  linkTo: string;
  color: string;
}

const DashboardCard: FC<DashboardProps> = ({
  title,
  value,
  icon,
  linkTo,
  color,
}) => {
  return (
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
};
interface TopProduct extends Product {
  totalSold: number;
}

const Dashboard = () => {
  const { inventory } = useSelector((state: RootState) => state.inventory);
  const { products } = useSelector((state: RootState) => state.products);
  const { sales } = useSelector((state: RootState) => state.sales);

  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const totalInventoryValue = inventory
    .reduce((total, item: InventoryItem) => {
      // Type item
      return total + item.quantity * item.costPerUnit;
    }, 0)
    .toFixed(2);

  const totalRevenue = sales
    .reduce((total, sale: Sale) => {
      // Type sale
      return total + sale.totalAmount;
    }, 0)
    .toFixed(2);

  useEffect(() => {
    // Find inventory items that are below reorder level
    const lowStock = inventory.filter(
      (item: InventoryItem) => item.quantity <= item.reorderLevel,
    );
    setLowStockItems(lowStock);

    // Get 5 most recent sales
    const recent = [...sales]
      .sort(
        (
          a: Sale,
          b: Sale, // Type a and b
        ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(), // Use getTime() for robust date comparison
      )
      .slice(0, 5);
    setRecentSales(recent);

    // Get top selling products
    const productSales: { [productId: string]: number } = {};

    sales.forEach((sale: Sale) => {
      sale.items.forEach((item) => {
        // Assuming sale.items is an array of objects with productId and quantity
        if (productSales[item.productId]) {
          productSales[item.productId] += item.quantity;
        } else {
          productSales[item.productId] = item.quantity;
        }
      });
    });

    const topProductsList: TopProduct[] = Object.keys(productSales)
      .map((productId): TopProduct | null => {
        // Explicit return type for map callback
        const product = products.find((p: Product) => p.id === productId);
        if (!product) {
          // Handle case where product might not be found (e.g., product deleted but sales data exists)
          // Depending on requirements, you might log this or skip. Here, we return null to filter out.
          return null;
        }
        return {
          ...product, // Spread the found product
          totalSold: productSales[productId],
        };
      })
      .filter((product): product is TopProduct => product !== null) // Type guard to remove nulls and assert type
      .sort((a: TopProduct, b: TopProduct) => b.totalSold - a.totalSold)
      .slice(0, 5);

    setTopProducts(topProductsList);
  }, [inventory, sales, products]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Inventory Items"
          value={inventory.length}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
          linkTo="/inventory"
          color="bg-blue-600"
        />

        <DashboardCard
          title="Products"
          value={products.length}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          linkTo="/products"
          color="bg-green-600"
        />

        <DashboardCard
          title="Sales"
          value={sales.length}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          linkTo="/sales"
          color="bg-purple-600"
        />

        <DashboardCard
          title="Revenue"
          value={`$${totalRevenue}`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          linkTo="/reports"
          color="bg-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Low Stock Alert</h2>
          {lowStockItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-right">
                      Quantity
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-right">
                      Reorder Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">
                        {item.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-right">
                        <span className="text-red-600 font-medium">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-right">
                        {item.reorderLevel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No low stock items found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">
                      Sale ID
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left">
                      Date
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">
                        {sale.id}
                      </td>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Inventory Value: ${totalInventoryValue}
          </h2>
          <div className="h-64">
            {/* Chart would be implemented here using Chart.js */}
            <div className="h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500">Inventory Value Chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
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
      </div>
    </div>
  );
};

export default Dashboard;
