// src/pages/Products/ProductsPage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteProduct, updateProduct } from '../../store/slices/productSlice.js';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sellingPrice: 0,
  });
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
    });
  
  // Calculate total product value
  const totalProductValue = products.reduce((total, product) => {
    return total + (product.quantity * product.sellingPrice);
  }, 0).toFixed(2);

  // Calculate total inventory cost
  const totalProductionCost = products.reduce((total, product) => {
    return total + (product.quantity * product.productionCost);
  }, 0).toFixed(2);

  // Calculate potential profit
  const totalPotentialProfit = products.reduce((total, product) => {
    return total + (product.quantity * (product.sellingPrice - product.productionCost));
  }, 0).toFixed(2);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (product) => {
    setEditingItem(product.id);
    setFormData({
      name: product.name,
      sellingPrice: product.sellingPrice,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : parseFloat(value)
    });
  };

  const handleSave = () => {
    if (editingItem) {
      dispatch(updateProduct({
        id: editingItem,
        ...formData
      }));
      setEditingItem(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      dispatch(deleteProduct(id));
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
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
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Link 
          to="/products/add" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Production Cost</h2>
          <p className="text-3xl font-bold text-red-600">${totalProductionCost}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Potential Profit</h2>
          <p className="text-3xl font-bold text-green-600">${totalPotentialProfit}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-700">Total Market Value:</span>
            <span className="font-bold text-lg">${totalProductValue}</span>
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
                  Product Name {getSortIcon('name')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-left"
                  onClick={() => handleSort('sku')}
                >
                  SKU {getSortIcon('sku')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {getSortIcon('quantity')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('productionCost')}
                >
                  Production Cost {getSortIcon('productionCost')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('sellingPrice')}
                >
                  Selling Price {getSortIcon('sellingPrice')}
                </th>
                <th className="py-2 px-4 border-b text-right">Profit Margin</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editingItem === product.id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        product.name
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{product.sku}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <span className={product.quantity === 0 ? "text-red-600 font-medium" : ""}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      ${product.productionCost.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {editingItem === product.id ? (
                        <input
                          type="number"
                          step="0.01"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                        />
                      ) : (
                        `$${product.sellingPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {(() => {
                        const margin = ((product.sellingPrice - product.productionCost) / product.sellingPrice * 100).toFixed(1);
                        const colorClass = margin < 15 ? 'text-red-600' : margin < 30 ? 'text-yellow-600' : 'text-green-600';
                        return <span className={`font-medium ${colorClass}`}>{margin}%</span>;
                      })()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex justify-center space-x-2">
                        {editingItem === product.id ? (
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
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
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
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    {searchTerm ? 'No products match your search.' : 'No products found. Create some products to get started.'}
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

export default ProductsPage;