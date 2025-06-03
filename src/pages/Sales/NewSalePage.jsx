// src/pages/Sales/NewSalePage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addSale } from '../../store/slices/salesSlice.js';

const NewSalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.products);
  const [customers] = useState([
    { id: 'walk-in', name: 'Walk-in Customer' },
    { id: 'customer1', name: 'John Doe' },
    { id: 'customer2', name: 'Jane Smith' }
  ]);

  const [saleItems, setSaleItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
  });
  const [selectedCustomer, setSelectedCustomer] = useState('walk-in');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [errors, setErrors] = useState({});

  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // 0%
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate all totals whenever items, tax, or discount changes
  useEffect(() => {
    const newSubtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newTaxAmount = newSubtotal * (taxRate / 100);
    const newDiscountAmount = newSubtotal * (discountPercent / 100);
    const newTotalAmount = newSubtotal + newTaxAmount - newDiscountAmount;

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setDiscountAmount(newDiscountAmount);
    setTotalAmount(newTotalAmount);
  }, [saleItems, taxRate, discountPercent]);

  // When product selection changes, update the price
  useEffect(() => {
    if (currentItem.productId) {
      const product = products.find((p) => p.id === currentItem.productId);
      if (product) {
        setCurrentItem({
          ...currentItem,
          unitPrice: product.sellingPrice,
          totalPrice: product.sellingPrice * currentItem.quantity,
        });
      }
    }
  }, [currentItem.productId, currentItem.quantity, products]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        setCurrentItem({
          ...currentItem,
          productId: value,
          unitPrice: product.sellingPrice,
          totalPrice: product.sellingPrice * currentItem.quantity,
        });
      } else {
        setCurrentItem({
          ...currentItem,
          productId: value,
          unitPrice: 0,
          totalPrice: 0,
        });
      }
    } else if (name === 'quantity') {
      const quantity = parseInt(value) || 0;
      setCurrentItem({
        ...currentItem,
        quantity,
        totalPrice: currentItem.unitPrice * quantity,
      });
    }

    // Clear error for this field when user changes value
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const addItemToSale = () => {
    const newErrors = {};
    
    if (!currentItem.productId) {
      newErrors.productId = "Please select a product";
    }
    
    if (currentItem.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than zero";
    }

    const product = products.find(p => p.id === currentItem.productId);
    if (product && product.quantity < currentItem.quantity) {
      newErrors.quantity = `Only ${product.quantity} units available in stock`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if product already exists in sale
    const existingItemIndex = saleItems.findIndex(
      item => item.productId === currentItem.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...saleItems];
      const oldQuantity = updatedItems[existingItemIndex].quantity;
      const newQuantity = oldQuantity + currentItem.quantity;
      
      // Check stock again with combined quantity
      if (product && product.quantity < newQuantity) {
        setErrors({
          quantity: `Can't add ${currentItem.quantity} more units. Only ${product.quantity - oldQuantity} units available`
        });
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        totalPrice: updatedItems[existingItemIndex].unitPrice * newQuantity
      };
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const productData = products.find(p => p.id === currentItem.productId);
      setSaleItems([...saleItems, {
        ...currentItem,
        productName: productData.name,
      }]);
    }

    // Reset current item
    setCurrentItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    });

    // Clear errors
    setErrors({});
  };

  const removeItem = (index) => {
    const updatedItems = [...saleItems];
    updatedItems.splice(index, 1);
    setSaleItems(updatedItems);
  };

  const handleTaxChange = (e) => {
    setTaxRate(parseFloat(e.target.value) || 0);
  };

  const handleDiscountChange = (e) => {
    setDiscountPercent(parseFloat(e.target.value) || 0);
  };

  const validateSale = () => {
    const newErrors = {};

    if (saleItems.length === 0) {
      newErrors.items = "Add at least one item to the sale";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateSale()) {
      const customer = customers.find(c => c.id === selectedCustomer);
      const newSale = {
        id: `SALE-${Date.now()}`,
        customerId: selectedCustomer,
        customerName: customer.name,
        items: saleItems,
        subtotal,
        taxAmount,
        taxRate,
        discountAmount,
        discountPercent,
        totalAmount,
        paymentMethod,
        status: 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch(addSale(newSale));
      navigate(`/sales/receipt/${newSale.id}`);
    }
  };

  const getAvailableStock = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.quantity : 0;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">New Sale</h1>
        <button
          onClick={() => navigate('/sales')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="productId">
                  Product
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={currentItem.productId}
                  onChange={handleItemChange}
                  className={`w-full border ${
                    errors.productId ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Product</option>
                  {products
                    .filter(product => product.quantity > 0 && product.isActive)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.sellingPrice.toFixed(2)} ({product.quantity} in stock)
                      </option>
                    ))}
                </select>
                {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleItemChange}
                  min="1"
                  max={getAvailableStock(currentItem.productId)}
                  className={`w-full border ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addItemToSale}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors w-full"
                  disabled={!currentItem.productId || currentItem.quantity <= 0}
                >
                  Add to Sale
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Items in Sale</h3>
              {errors.items && <p className="text-red-500 text-sm mb-2">{errors.items}</p>}
              
              {saleItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Product</th>
                        <th className="py-2 px-4 text-right">Price</th>
                        <th className="py-2 px-4 text-center">Quantity</th>
                        <th className="py-2 px-4 text-right">Total</th>
                        <th className="py-2 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-4">{item.productName}</td>
                          <td className="py-2 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-4 text-center">{item.quantity}</td>
                          <td className="py-2 px-4 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                          <td className="py-2 px-4 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No items added to sale yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sale Summary</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="customer">
                Customer
              </label>
              <select
                id="customer"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="paymentMethod">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full border ${
                  errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Payment">Mobile Payment</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="taxRate">
                  Tax (%)
                </label>
                <input
                  type="number"
                  id="taxRate"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={handleTaxChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="discount">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountPercent}
                  onChange={handleDiscountChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-lg font-medium transition-colors"
                disabled={saleItems.length === 0}
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSalePage;