// src/pages/Inventory/InventoryPage.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteInventoryItem, updateInventoryItem } from '../../store/slices/inventorySlice.js';

const InventoryPage  = () => {
  const dispatch = useDispatch();
  const { inventory, loading } = useSelector((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    costPerUnit: 0,
    unit: '',
    reorderLevel: 0
  });
  
  // Filter and sort inventory items
  const filteredInventory = inventory
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  // Calculate total inventory value
  const totalInventoryValue = inventory.reduce((total, item) => {
    return total + (item.quantity * item.costPerUnit);
  }, 0).toFixed(2);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      costPerUnit: item.costPerUnit,
      unit: item.unit,
      reorderLevel: item.reorderLevel
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' || name === 'unit' ? value : parseFloat(value)
    });
  };

  const handleSave = () => {
    if (editingItem) {
      dispatch(updateInventoryItem({
        id: editingItem,
        ...formData
      }));
      setEditingItem(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      dispatch(deleteInventoryItem(id));
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
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Link 
          to="/inventory/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add New Item
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search inventory..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-700">Total Inventory Value:</span>
            <span className="font-bold text-lg">${totalInventoryValue}</span>
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
                  className="py-2 px-4 border-b cursor-pointer text-center"
                  onClick={() => handleSort('unit')}
                >
                  Unit {getSortIcon('unit')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('costPerUnit')}
                >
                  Cost Per Unit {getSortIcon('costPerUnit')}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer text-right"
                  onClick={() => handleSort('reorderLevel')}
                >
                  Reorder Level {getSortIcon('reorderLevel')}
                </th>
                <th className="py-2 px-4 border-b text-right">Total Value</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{item.sku}</td>
                    <td className="py-2 px-4 border-b text-right">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-20 text-right"
                        />
                      ) : (
                        <span className={item.quantity <= item.reorderLevel ? "text-red-600 font-medium" : ""}>
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-20 text-center"
                        />
                      ) : (
                        item.unit
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          name="costPerUnit"
                          value={formData.costPerUnit}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                        />
                      ) : (
                        `$${item.costPerUnit.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          name="reorderLevel"
                          value={formData.reorderLevel}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 w-20 text-right"
                        />
                      ) : (
                        item.reorderLevel
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-right font-medium">
                      ${(item.quantity * item.costPerUnit).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex justify-center space-x-2">
                        {editingItem === item.id ? (
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
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
                  <td colSpan="8" className="py-4 text-center text-gray-500">
                    {searchTerm ? 'No inventory items match your search.' : 'No inventory items found. Add some items to get started.'}
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

export default InventoryPage;