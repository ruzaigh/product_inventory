import {ChangeEvent, FC, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteCustomer, updateCustomer, toggleCustomerStatus, Customer, CustomerType } from '../../store/slices/customerSlice';
import { RootState } from '../../store';

type SortField = keyof Pick<Customer, 'name' | 'email' | 'phone' | 'customerType' | 'totalPurchases' | 'totalSpent' | 'lastPurchaseDate'>;
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | CustomerType;

interface FormData {
    name: string;
    email: string;
    phone: string;
}

const CustomersPage: FC = () => {
    const dispatch = useDispatch();
    const { customers, loading } = useSelector((state: RootState) => state.customers);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
    });

    // Filter and sort customers
    const filteredCustomers = customers
        .filter(customer => {
            // Search filter
            const searchMatch =
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (customer.phone && customer.phone.includes(searchTerm));

            // Type filter
            const typeMatch = filterType === 'all' || customer.customerType === filterType;

            return searchMatch && typeMatch;
        })
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            // Handle null values for lastPurchaseDate
            if (sortField === 'lastPurchaseDate') {
                if (!aValue && !bValue) return 0;
                if (!aValue) return sortDirection === 'asc' ? 1 : -1;
                if (!bValue) return sortDirection === 'asc' ? -1 : 1;
                const aDate = new Date(aValue as string).getTime();
                const bDate = new Date(bValue as string).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

    // Calculate statistics
    const totalCustomers = customers.filter(c => c.isActive).length;
    const totalRevenue = customers.reduce((total, customer) => total + customer.totalSpent, 0).toFixed(2);
    const averageSpent = totalCustomers > 0
        ? (customers.reduce((total, customer) => total + customer.totalSpent, 0) / totalCustomers).toFixed(2)
        : '0.00';

    const handleSort = (field: SortField): void => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleEdit = (customer: Customer): void => {
        setEditingItem(customer.id);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
        });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSave = (): void => {
        if (editingItem) {
            dispatch(updateCustomer({
                id: editingItem,
                ...formData
            }));
            setEditingItem(null);
        }
    };

    const handleDelete = (id: string): void => {
        const customer = customers.find(c => c.id === id);
        if (customer?.id === 'walk-in') {
            alert('Cannot delete the Walk-in Customer. This is a system customer.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            dispatch(deleteCustomer(id));
        }
    };

    const handleToggleStatus = (id: string): void => {
        const customer = customers.find(c => c.id === id);
        if (customer?.id === 'walk-in') {
            alert('Cannot deactivate the Walk-in Customer. This is a system customer.');
            return;
        }
        dispatch(toggleCustomerStatus(id));
    };

    const getSortIcon = (field: SortField): string | null => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const getCustomerTypeColor = (type: CustomerType): string => {
        switch (type) {
            case 'vip':
                return 'bg-purple-100 text-purple-800';
            case 'regular':
                return 'bg-blue-100 text-blue-800';
            case 'walk-in':
                return 'bg-gray-100 text-gray-800';
            case 'wholesale':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatLastPurchase = (dateString: string | null): string => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Customer Management</h1>
                <Link
                    to="/customers/add"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                    Add New Customer
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Total Customers</h2>
                    <p className="text-3xl font-bold">{totalCustomers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
                    <p className="text-3xl font-bold text-green-600">${totalRevenue}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700">Average Spent</h2>
                    <p className="text-3xl font-bold">${averageSpent}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                    <div className="w-full md:w-auto mb-4 md:mb-0">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="border border-gray-300 rounded-md px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="vip">VIP</option>
                            <option value="regular">Regular</option>
                            <option value="wholesale">Wholesale</option>
                            <option value="walk-in">Walk-in</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                        <tr className="bg-gray-100">
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-left"
                                onClick={() => handleSort('name')}
                            >
                                Name {getSortIcon('name')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-left"
                                onClick={() => handleSort('email')}
                            >
                                Email {getSortIcon('email')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-left"
                                onClick={() => handleSort('phone')}
                            >
                                Phone {getSortIcon('phone')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-center"
                                onClick={() => handleSort('customerType')}
                            >
                                Type {getSortIcon('customerType')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-right"
                                onClick={() => handleSort('totalPurchases')}
                            >
                                Purchases {getSortIcon('totalPurchases')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-right"
                                onClick={() => handleSort('totalSpent')}
                            >
                                Total Spent {getSortIcon('totalSpent')}
                            </th>
                            <th
                                className="py-2 px-4 border-b cursor-pointer text-center"
                                onClick={() => handleSort('lastPurchaseDate')}
                            >
                                Last Purchase {getSortIcon('lastPurchaseDate')}
                            </th>
                            <th className="py-2 px-4 border-b text-center">Status</th>
                            <th className="py-2 px-4 border-b text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className={`hover:bg-gray-50 ${!customer.isActive ? 'opacity-60' : ''}`}>
                                    <td className="py-2 px-4 border-b">
                                        {editingItem === customer.id ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="border border-gray-300 rounded px-2 py-1 w-full"
                                            />
                                        ) : (
                                            <div>
                                                <span className="font-medium">{customer.name}</span>
                                                {customer.notes && (
                                                    <div className="text-xs text-gray-500 truncate">{customer.notes}</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingItem === customer.id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="border border-gray-300 rounded px-2 py-1 w-full"
                                            />
                                        ) : (
                                            customer.email || '-'
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {editingItem === customer.id ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="border border-gray-300 rounded px-2 py-1 w-full"
                                            />
                                        ) : (
                                            customer.phone || '-'
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.customerType)}`}>
                        {customer.customerType.toUpperCase()}
                      </span>
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {customer.totalPurchases}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right font-medium">
                                        ${customer.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center text-sm">
                                        {formatLastPurchase(customer.lastPurchaseDate)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex justify-center space-x-2">
                                            {editingItem === customer.id ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingItem(null)}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(customer)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(customer.id)}
                                                        className={customer.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                                                    >
                                                        {customer.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-4 text-center text-gray-500">
                                    {searchTerm || filterType !== 'all'
                                        ? 'No customers match your search criteria.'
                                        : 'No customers found. Add some customers to get started.'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersPage;