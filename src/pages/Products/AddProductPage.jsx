// src/pages/Products/AddProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../../store/slices/productSlice';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventory } = useSelector((state) => state.inventory);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    sellingPrice: 0,
    quantity: 0,
    isActive: true,
  });
  
  const [materials, setMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    inventoryItemId: '',
    quantity: 1
  });
  
  const [errors, setErrors] = useState({});
  const [productionCost, setProductionCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  // Update production cost whenever materials change
  useEffect(() => {
    let cost = 0;
    materials.forEach((material) => {
      const inventoryItem = inventory.find(item => item.id === material.inventoryItemId);
      if (inventoryItem) {
        cost += inventoryItem.costPerUnit * material.quantity;
      }
    });
    setProductionCost(cost);
  }, [materials, inventory]);

  // Update profit margin when selling price or production cost changes
  useEffect(() => {
    if (formData.sellingPrice > 0) {
      const margin = ((formData.sellingPrice - productionCost) / formData.sellingPrice) * 100;
      setProfitMargin(margin);
    } else {
      setProfitMargin(0);
    }
  }, [formData.sellingPrice, productionCost]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = value;
    
    if (type === 'checkbox') {
      parsedValue = checked;
    } else if (name === 'quantity') {
      parsedValue = parseInt(value) || 0;
    } else if (name === 'sellingPrice') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial({
      ...currentMaterial,
      [name]: name === 'quantity' ? (parseInt(value) || 0) : value
    });
  };

  const addMaterial = () => {
    if (!currentMaterial.inventoryItemId) {
      setErrors({
        ...errors,
        materialId: 'Please select a material'
      });
      return;
    }

    if (currentMaterial.quantity <= 0) {
      setErrors({
        ...errors,
        materialQuantity: 'Quantity must be greater than zero'
      });
      return;
    }

    // Check if the material already exists
    const existingIndex = materials.findIndex(
      m => m.inventoryItemId === currentMaterial.inventoryItemId
    );

    if (existingIndex >= 0) {
      // Update existing material quantity
      const updatedMaterials = [...materials];
      updatedMaterials[existingIndex] = {
        ...updatedMaterials[existingIndex],
        quantity: updatedMaterials[existingIndex].quantity + currentMaterial.quantity
      };
      setMaterials(updatedMaterials);
    } else {
      // Add new material
      setMaterials([...materials, { ...currentMaterial }]);
    }

    // Reset current material
    setCurrentMaterial({
      inventoryItemId: '',
      quantity: 1
    });

    // Clear errors
    setErrors({
      ...errors,
      materialId: null,
      materialQuantity: null
    });
  };

  const removeMaterial = (index) => {
    const updatedMaterials = [...materials];
    updatedMaterials.splice(index, 1);
    setMaterials(updatedMaterials);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than zero';
    }
    
    if (materials.length === 0) {
      newErrors.materials = 'At least one material is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, we'd validate if we have enough inventory for initial production
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        productionCost,
        materials, // This would be 'recipe' in a real app
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch(addProduct(newProduct));
      navigate('/products');
    }
  };

  // Get the name of an inventory item by id
  const getInventoryItemName = (id) => {
    const item = inventory.find(item => item.id === id);
    return item ? item.name : 'Unknown Item';
  };

  // Get the cost of a material
  const getMaterialCost = (materialItem) => {
    const item = inventory.find(i => i.id === materialItem.inventoryItemId);
    return item ? item.costPerUnit * materialItem.quantity : 0;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <button
          onClick={() => navigate('/products')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Products
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter product name"
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
                placeholder="e.g. PROD-001"
              />
              {errors.sku && <p className="text-red-500 mt-1 text-sm">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="sellingPrice">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className={`w-full border ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.sellingPrice && <p className="text-red-500 mt-1 text-sm">{errors.sellingPrice}</p>}
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="initialQuantity">
                Initial Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <p className="text-gray-500 text-sm mt-1">Optional: Initial stock quantity</p>
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
              rows="3"
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-gray-700">
                Active Product
              </label>
            </div>
            <p className="text-gray-500 text-sm mt-1">Inactive products won't show up in sales</p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Material Requirements</h2>
            <p className={`mb-4 ${errors.materials ? 'text-red-500' : 'text-gray-500'}`}>
              Add materials required to make this product
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="inventoryItemId">
                  Material
                </label>
                <select
                  id="inventoryItemId"
                  name="inventoryItemId"
                  value={currentMaterial.inventoryItemId}
                  onChange={handleMaterialChange}
                  className={`w-full border ${errors.materialId ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Material</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
                {errors.materialId && <p className="text-red-500 mt-1 text-sm">{errors.materialId}</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  type="number"
                  id="materialQuantity"
                  name="quantity"
                  value={currentMaterial.quantity}
                  onChange={handleMaterialChange}
                  className={`w-full border ${errors.materialQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min="1"
                />
                {errors.materialQuantity && <p className="text-red-500 mt-1 text-sm">{errors.materialQuantity}</p>}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addMaterial}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add Material
                </button>
              </div>
            </div>

            {materials.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Materials List:</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Material</th>
                        <th className="text-center pb-2">Quantity</th>
                        <th className="text-right pb-2">Cost</th>
                        <th className="text-right pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{getInventoryItemName(material.inventoryItemId)}</td>
                          <td className="py-2 text-center">{material.quantity}</td>
                          <td className="py-2 text-right">${getMaterialCost(material).toFixed(2)}</td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeMaterial(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="pt-2 text-right font-medium">Total Production Cost:</td>
                        <td colSpan="2" className="pt-2 text-right font-bold">${productionCost.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Production Cost: ${productionCost.toFixed(2)}</p>
                <p className="text-gray-700 font-medium">Selling Price: ${formData.sellingPrice.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 font-medium">Profit per Item: ${(formData.sellingPrice - productionCost).toFixed(2)}</p>
                <p className="text-gray-700 font-medium">
                  Profit Margin: <span className={profitMargin < 0 ? 'text-red-600' : 'text-green-600'}>{profitMargin.toFixed(1)}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;