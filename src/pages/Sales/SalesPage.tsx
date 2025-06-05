import { FC, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {deleteSale, Sale} from '../../store/slices/salesSlice.js';
import { AppDispatch, RootState } from '../../store';

// Types and Interfaces

interface DateFilter {
  startDate: string;
  endDate: string;
}

interface SalesMetrics {
  totalSales: number;
  totalRevenue: string;
  averageSaleValue: string;
}

type SortField = keyof Pick<Sale, 'id' | 'createdAt' | 'customerName' | 'totalAmount' | 'paymentMethod' | 'status'>;
type SortDirection = 'asc' | 'desc';

// Utility Functions
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

const getStatusStyles = (status: Sale['status']): string => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  switch (status) {
    case 'Completed':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'Voided':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
  }
};

// Custom Hooks
const useSalesFiltering = (sales: Sale[], searchTerm: string, dateFilter: DateFilter, sortField: SortField, sortDirection: SortDirection) => {
  return useMemo(() => {
    return sales
        .filter(sale => {
          // Search filter
          const searchMatch =
              sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

          // Date filter
          let dateMatch = true;
          if (dateFilter.startDate) {
            dateMatch = dateMatch && new Date(sale.createdAt) >= new Date(dateFilter.startDate);
          }
          if (dateFilter.endDate) {
            const endDate = new Date(dateFilter.endDate);
            endDate.setDate(endDate.getDate() + 1);
            dateMatch = dateMatch && new Date(sale.createdAt) < endDate;
          }

          return searchMatch && dateMatch;
        })
        .sort((a, b) => {
          const aValue = sortField === 'createdAt' ? new Date(a[sortField]).getTime() : a[sortField];
          const bValue = sortField === 'createdAt' ? new Date(b[sortField]).getTime() : b[sortField];

          if (sortField === 'createdAt') {
            const numA = Number(aValue);
            const numB = Number(bValue);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
          } else {
            const numA = Number(aValue);
            const numB = Number(bValue);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
          }
        });
  }, [sales, searchTerm, dateFilter, sortField, sortDirection]);
};

const useSalesMetrics = (sales: Sale[]): SalesMetrics => {
  return useMemo(() => {
    const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);
    const totalSales = sales.length;
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
      averageSaleValue: averageSaleValue.toFixed(2),
    };
  }, [sales]);
};

const useDateFilter = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: ''
  });

  const handleDateFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter({ startDate: '', endDate: '' });
  }, []);

  const hasDateFilter = useMemo(() => {
    return Boolean(dateFilter.startDate || dateFilter.endDate);
  }, [dateFilter]);

  return {
    dateFilter,
    handleDateFilterChange,
    clearDateFilter,
    hasDateFilter
  };
};

// Components
interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className = "h-64" }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, valueClassName = "" }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
    </div>
);

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

const SortableHeader: FC<SortableHeaderProps> = ({
                                                   field,
                                                   children,
                                                   currentSortField,
                                                   sortDirection,
                                                   onSort,
                                                   className = "text-left"
                                                 }) => (
    <th
        className={`py-2 px-4 border-b cursor-pointer ${className}`}
        onClick={() => onSort(field)}
    >
      {children} {currentSortField === field && (sortDirection === 'asc' ? '▲' : '▼')}
    </th>
);

interface DateFilterProps {
  dateFilter: DateFilter;
  hasDateFilter: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const DateFilterSection: FC<DateFilterProps> = ({
                                                  dateFilter,
                                                  hasDateFilter,
                                                  onChange,
                                                  onClear
                                                }) => (
    <div className="flex flex-wrap items-center space-x-2">
      <div>
        <label htmlFor="startDate" className="mr-2 text-gray-700">From:</label>
        <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateFilter.startDate}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="endDate" className="mr-2 text-gray-700">To:</label>
        <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateFilter.endDate}
            onChange={onChange}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {hasDateFilter && (
          <button
              onClick={onClear}
              className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
      )}
    </div>
);

interface SearchAndFilterProps {
  searchTerm: string;
  dateFilter: DateFilter;
  hasDateFilter: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDateFilter: () => void;
}

const SearchAndFilter: FC<SearchAndFilterProps> = ({
                                                     searchTerm,
                                                     dateFilter,
                                                     hasDateFilter,
                                                     onSearchChange,
                                                     onDateFilterChange,
                                                     onClearDateFilter
                                                   }) => (
    <div className="flex flex-wrap items-center justify-between mb-4">
      <div className="w-full md:w-auto mb-4 md:mb-0">
        <input
            type="text"
            placeholder="Search sales..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={onSearchChange}
        />
      </div>

      <DateFilterSection
          dateFilter={dateFilter}
          hasDateFilter={hasDateFilter}
          onChange={onDateFilterChange}
          onClear={onClearDateFilter}
      />
    </div>
);

interface SalesTableRowProps {
  sale: Sale;
  onDelete: (id: string) => void;
}

const SalesTableRow: FC<SalesTableRowProps> = ({ sale, onDelete }) => (
    <tr className="hover:bg-gray-50">
      <td className="py-2 px-4 border-b font-medium">{sale.id}</td>
      <td className="py-2 px-4 border-b">
        {formatDateTime(sale.createdAt)}
      </td>
      <td className="py-2 px-4 border-b">
        {sale.customerName || 'Walk-in Customer'}
      </td>
      <td className="py-2 px-4 border-b text-right font-medium">
        {formatCurrency(sale.totalAmount)}
      </td>
      <td className="py-2 px-4 border-b text-center">
        {sale.paymentMethod}
      </td>
      <td className="py-2 px-4 border-b text-center">
      <span className={getStatusStyles(sale.status)}>
        {sale.status}
      </span>
      </td>
      <td className="py-2 px-4 border-b">
        <div className="flex justify-center space-x-3">
          <Link
              to={`/sales/receipt/${sale.id}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            View
          </Link>
          {sale.status !== 'Voided' && (
              <button
                  onClick={() => onDelete(sale.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
              >
                Void
              </button>
          )}
        </div>
      </td>
    </tr>
);

interface MetricsDashboardProps {
  metrics: SalesMetrics;
}

const MetricsDashboard: FC<MetricsDashboardProps> = ({ metrics }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard
          title="Total Sales"
          value={metrics.totalSales}
      />
      <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue}`}
          valueClassName="text-green-600"
      />
      <MetricCard
          title="Average Sale Value"
          value={`$${metrics.averageSaleValue}`}
      />
    </div>
);

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: FC<EmptyStateProps> = ({ hasFilters }) => (
    <tr>
      <td colSpan={7} className="py-4 text-center text-gray-500">
        {hasFilters
            ? 'No sales match your search criteria.'
            : 'No sales records found. Create your first sale to get started.'}
      </td>
    </tr>
);

// Main Component
const SalesPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sales, loading } = useSelector((state: RootState) => state.sales);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const {
    dateFilter,
    handleDateFilterChange,
    clearDateFilter,
    hasDateFilter
  } = useDateFilter();

  const filteredSales = useSalesFiltering(sales, searchTerm, dateFilter, sortField, sortDirection);
  const metrics = useSalesMetrics(sales);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to void this sale? This action cannot be undone.')) {
      dispatch(deleteSale(id));
    }
  }, [dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const hasFilters = useMemo(() => {
    return Boolean(searchTerm || hasDateFilter);
  }, [searchTerm, hasDateFilter]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sales History</h1>
          <Link
              to="/sales/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            New Sale
          </Link>
        </div>

        <MetricsDashboard metrics={metrics} />

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <SearchAndFilter
              searchTerm={searchTerm}
              dateFilter={dateFilter}
              hasDateFilter={hasDateFilter}
              onSearchChange={handleSearchChange}
              onDateFilterChange={handleDateFilterChange}
              onClearDateFilter={clearDateFilter}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
              <tr className="bg-gray-100">
                <SortableHeader
                    field="id"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                >
                  Sale ID
                </SortableHeader>
                <SortableHeader
                    field="createdAt"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                >
                  Date
                </SortableHeader>
                <SortableHeader
                    field="customerName"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                >
                  Customer
                </SortableHeader>
                <SortableHeader
                    field="totalAmount"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-right"
                >
                  Amount
                </SortableHeader>
                <SortableHeader
                    field="paymentMethod"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-center"
                >
                  Payment Method
                </SortableHeader>
                <SortableHeader
                    field="status"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-center"
                >
                  Status
                </SortableHeader>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                      <SalesTableRow
                          key={sale.id}
                          sale={sale}
                          onDelete={handleDelete}
                      />
                  ))
              ) : (
                  <EmptyState hasFilters={hasFilters} />
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default SalesPage;