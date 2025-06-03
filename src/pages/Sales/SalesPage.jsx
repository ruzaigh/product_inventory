// src/pages/Sales/SalesPage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSale } from '../../store/slices/salesSlice';

const SalesPage = () => {
  const dispatch = useDispatch();
  const { sales, loading } = useSelector((state) => state.sales);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Filter and sort sales
  const filteredSales = sales
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
        // Add one day to include the end date fully
        const endDate = new Date(dateFilter.endDate);
        endDate.setDate(endDate.getDate() + 1);
        dateMatch = dateMatch && new Date(sale.createdAt) < endDate;
      }
      
      return searchMatch && dateMatch;
    })
    .sort((a, b) => {
      const aValue = sortField === 'createdAt' ? new Date(a[sortField]) : a[sortField];
      const bValue = sortField === 'createdAt' ? new Date(b[sortField]) : b[sortField];
      
      if (sortField === 'createdAt') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  
  // Calculate totals
  const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0).toFixed(2);
  const totalSales = sales.length;
  const averageSaleValue = totalSales > 0 
    ? (sales.reduce((total, sale) => total + sale.totalAmount, 0) / totalSales).toFixed(2)
    : '0.00';
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to void this sale? This action cannot be undone.')) {
      dispatch(deleteSale(id));
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter({
      ...dateFilter,
      [name]: value
    });
  };

  const clearDateFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: ''
    });
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
        <h1 className="text-3xl font-bold">Sales History</h1>
        <Link 
          to="/sales/new" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
          <p className="text-3xl font-bold">{totalSales}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">${totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Average Sale Value</h2>
          <p className="text-3xl font-bold">${averageSaleValue}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search sales..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center space-x-2">
            <div>
              <label htmlFor="startDate" className="mr-2 text-gray-700">From:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateFilterChange}
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
                onChange={handleDateFilterChange}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <button
                onClick={clearDateFilter}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-left"
                  onClick={() => handleSort('id')}
                >
                  Sale ID {getSortIcon('id')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-left"
                  onClick={() => handleSort('createdAt')}
                >
                  Date {getSortIcon('createdAt')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-left"
                  onClick={() => handleSort('customerName')}
                >
                  Customer {getSortIcon('customerName')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('totalAmount')}
                >
                  Amount {getSortIcon('totalAmount')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-center"
                  onClick={() => handleSort('paymentMethod')}
                >
                  Payment Method {getSortIcon('paymentMethod')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-center"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">{sale.id}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {sale.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="py-2 px-4 border-b text-right font-medium">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {sale.paymentMethod}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          sale.status === 'Voided' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex justify-center space-x-3">
                        <Link
                          to={`/sales/receipt/${sale.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        {sale.status !== 'Voided' && (
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    {searchTerm || dateFilter.startDate || dateFilter.endDate
                      ? 'No sales match your search criteria.'
                      : 'No sales records found. Create your first sale to get started.'}
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

export default SalesPage;