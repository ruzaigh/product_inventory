
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setReportsData } from '../../store/slices/reportsSlice';

interface FinancialOverviewProps {
    totalInventoryCost: number;
    totalRevenue: number;
    totalProfit: number;
}

const FinancialOverview: FC<FinancialOverviewProps> = ({ totalInventoryCost, totalRevenue, totalProfit }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Financial Overview</h3>
        <p>Total Inventory Cost: ${totalInventoryCost.toFixed(2)}</p>
        <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
        <p>Total Profit: ${totalProfit.toFixed(2)}</p>
    </div>
);

interface HistoricalSalesProps {
    sales: Array<{ date: string; sales: number }>;
}

const HistoricalSales: FC<HistoricalSalesProps> = ({ sales }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Historical Sales</h3>
        <ul>
            {sales.map((sale, index) => (
                <li key={index}>
                    {sale.date}: ${sale.sales.toFixed(2)}
                </li>
            ))}
        </ul>
    </div>
);

interface InventoryUsageProps {
    usage: Array<{ item: string; quantityUsed: number }>;
}

const InventoryUsage: FC<InventoryUsageProps> = ({ usage }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Inventory Usage</h3>
        <ul>
            {usage.map((item, index) => (
                <li key={index}>
                    {item.item}: {item.quantityUsed} units used
                </li>
            ))}
        </ul>
    </div>
);

const ReportsPage: FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const inventory = useSelector((state: RootState) => state.inventory.inventory);
    const sales = useSelector((state: RootState) => state.sales.sales);
    const reportData = useSelector((state: RootState) => state.reports);

    useEffect(() => {
        if (inventory.length === 0 && sales.length === 0) return;

        const totalInventoryCost = inventory.reduce((acc, item) => acc + item.costPerUnit * item.quantity, 0);
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalCostOfGoodsSold = sales.reduce(
            (acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity * item.unitPrice, 0),
            0
        );
        const totalProfit = totalRevenue - totalCostOfGoodsSold;
        const historicalSales = sales.map((sale) => ({ date: sale.createdAt, sales: sale.totalAmount }));
        const inventoryUsage = inventory.map((item) => ({
            item: item.name,
            quantityUsed: 0, // Placeholder, adjust if you have usage data
        }));

        dispatch(
            setReportsData({
                totalInventoryCost,
                totalRevenue,
                totalProfit,
                historicalSales,
                inventoryUsage,
            })
        );
    }, [inventory, sales, dispatch]);

    if (!reportData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Reports</h1>
            <FinancialOverview
                totalInventoryCost={reportData.totalInventoryCost}
                totalRevenue={reportData.totalRevenue}
                totalProfit={reportData.totalProfit}
            />
            <HistoricalSales sales={reportData.historicalSales} />
            <InventoryUsage usage={reportData.inventoryUsage} />
        </div>
    );
};

export default ReportsPage;