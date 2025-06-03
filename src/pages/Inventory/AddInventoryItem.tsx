import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addInventoryItem } from '../../store/slices/inventorySlice.js';

const AddInventoryItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    quantity: 0,
    costPerUnit: 0,
    unit: 'pcs', // Default unit
    category: '',
    reorderLevel: 5, // Default reorder level
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    
    // Convert numeric fields to numbers
    if (name === 'quantity' || name === 'reorderLevel') {
      parsedValue = parseInt(value) || 0;
    } else if (name === 'costPerUnit') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.costPerUnit <= 0) {
      newErrors.costPerUnit = 'Cost per unit must be greater than zero';
    }
    
    if (formData.reorderLevel < 0) {
      newErrors.reorderLevel = 'Reorder level cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate a unique ID (in a real app, this would be done by the backend)
      const newItem = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch(addInventoryItem(newItem));
      navigate('/inventory');
    }
  };

  const units = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'carton', 'pack', 'bottle', 'roll', 'sheet', 'yard', 'meter', 'inch', 'cm'];
  const categories = ['Raw Materials', 'Ingredients', 'Packaging', 'Office Supplies', 'Cleaning Supplies', 'Tools', 'Other'];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add Inventory Item</h1>
        <button
          onClick={() => navigate('/inventory')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Inventory
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full border ${errors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g. INV-001"
              />
              {errors.sku && <p className="text-red-500 mt-1 text-sm">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                min="0"
              />
              {errors.quantity && <p className="text-red-500 mt-1 text-sm">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-3/4 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={`w-1/4 border ${errors.unit ? 'border-red-500' : 'border-gray-300'} border-l-0 rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Custom"
                />
              </div>
              {errors.unit && <p className="text-red-500 mt-1 text-sm">{errors.unit}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="costPerUnit">
                Cost Per Unit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="costPerUnit"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  onChange={handleChange}
                  className={`w-full border ${errors.costPerUnit ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.costPerUnit && <p className="text-red-500 mt-1 text-sm">{errors.costPerUnit}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="reorderLevel">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="reorderLevel"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                className={`w-full border ${errors.reorderLevel ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                min="0"
              />
              {errors.reorderLevel && <p className="text-red-500 mt-1 text-sm">{errors.reorderLevel}</p>}
              <p className="text-gray-500 text-sm mt-1">Minimum quantity before reordering is suggested</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter item description"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryItem;