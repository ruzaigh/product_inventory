import {useState, useCallback, useMemo, FC, ChangeEvent, ReactNode, FormEvent} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {addSale, SaleItem} from "../../store/slices/salesSlice.js";
import { updateCustomerPurchaseStats, Customer } from "../../store/slices/customerSlice";
import { AppDispatch, RootState } from "../../store";

// Types and Interfaces
interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  isActive: boolean;
}

interface CurrentItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

interface FormErrors {
  [key: string]: string | null;
}

interface NewSale extends SaleCalculations {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  taxRate: number;
  discountPercent: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Mobile Payment",
] as const;

const INITIAL_CURRENT_ITEM: CurrentItem = {
  productId: "",
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
};

// Components
interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  error?: string | null;
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  error?: string | null;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

interface ProductSelectorProps {
  products: Product[];
  currentItem: CurrentItem;
  errors: FormErrors;
  getAvailableStock: (productId: string) => number;
  onChange: (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onAdd: () => void;
}

interface SaleItemsTableProps {
  saleItems: SaleItem[];
  onRemove: (index: number) => void;
  error?: string | null;
}

interface SaleSummaryProps {
  selectedCustomer: string;
  paymentMethod: string;
  taxRate: number;
  discountPercent: number;
  calculations: SaleCalculations;
  errors: FormErrors;
  customers: Customer[];
  onCustomerChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPaymentMethodChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onTaxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDiscountChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Custom Hooks
const useSaleCalculations = (
    saleItems: SaleItem[],
    taxRate: number,
    discountPercent: number,
): SaleCalculations => {
  return useMemo(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  }, [saleItems, taxRate, discountPercent]);
};

const useItemManagement = (products: Product[]) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] =
      useState<CurrentItem>(INITIAL_CURRENT_ITEM);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = useCallback(
      (fieldName: string) => {
        if (errors[fieldName]) {
          setErrors((prev) => ({ ...prev, [fieldName]: null }));
        }
      },
      [errors],
  );

  const handleItemChange = useCallback(
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "productId") {
          const product = products.find((p) => p.id === value);
          if (product) {
            setCurrentItem((prev) => ({
              ...prev,
              productId: value,
              unitPrice: product.sellingPrice,
              totalPrice: product.sellingPrice * prev.quantity,
            }));
          } else {
            setCurrentItem((prev) => ({
              ...prev,
              productId: value,
              unitPrice: 0,
              totalPrice: 0,
            }));
          }
        } else if (name === "quantity") {
          const quantity = parseInt(value) || 0;
          setCurrentItem((prev) => ({
            ...prev,
            quantity,
            totalPrice: prev.unitPrice * quantity,
          }));
        }

        clearFieldError(name);
      },
      [products, clearFieldError],
  );

  const addItemToSale = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!currentItem.productId) {
      newErrors.productId = "Please select a product";
    }

    if (currentItem.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than zero";
    }

    const product = products.find((p) => p.id === currentItem.productId);
    if (product && product.quantity < currentItem.quantity) {
      newErrors.quantity = `Only ${product.quantity} units available in stock`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if product already exists in sale
    const existingItemIndex = saleItems.findIndex(
        (item) => item.productId === currentItem.productId,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const oldQuantity = saleItems[existingItemIndex].quantity;
      const newQuantity = oldQuantity + currentItem.quantity;

      // Check stock again with combined quantity
      if (product && product.quantity < newQuantity) {
        setErrors({
          quantity: `Can't add ${currentItem.quantity} more units. Only ${product.quantity - oldQuantity} units available`,
        });
        return;
      }

      setSaleItems((prev) => {
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: newQuantity,
          totalPrice: updated[existingItemIndex].unitPrice * newQuantity,
        };
        return updated;
      });
    } else {
      // Add new item
      const productData = products.find((p) => p.id === currentItem.productId);
      if (productData) {
        setSaleItems((prev) => [
          ...prev,
          {
            ...currentItem,
            productName: productData.name,
          },
        ]);
      }
    }

    // Reset current item
    setCurrentItem(INITIAL_CURRENT_ITEM);
    setErrors({});
  }, [currentItem, saleItems, products]);

  const removeItem = useCallback((index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getAvailableStock = useCallback(
      (productId: string) => {
        const product = products.find((p) => p.id === productId);
        return product ? product.quantity : 0;
      },
      [products],
  );

  return {
    saleItems,
    currentItem,
    errors,
    handleItemChange,
    addItemToSale,
    removeItem,
    getAvailableStock,
    setErrors,
  };
};

const useSaleForm = (defaultCustomer: string = 'walk-in') => {
  const [selectedCustomer, setSelectedCustomer] = useState(defaultCustomer);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [taxRate, setTaxRate] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleTaxChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setTaxRate(parseFloat(e.target.value) || 0);
      },
      [],
  );

  const handleDiscountChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setDiscountPercent(parseFloat(e.target.value) || 0);
      },
      [],
  );

  const handleCustomerChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCustomer(e.target.value);
      },
      [],
  );

  const handlePaymentMethodChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        setPaymentMethod(e.target.value);
      },
      [],
  );

  return {
    selectedCustomer,
    paymentMethod,
    taxRate,
    discountPercent,
    handleTaxChange,
    handleDiscountChange,
    handleCustomerChange,
    handlePaymentMethodChange,
  };
};

const FormField: FC<FormFieldProps> = ({
                                         label,
                                         name,
                                         value,
                                         type = "text",
                                         error,
                                         min,
                                         max,
                                         step,
                                         placeholder,
                                         onChange,
                                         children,
                                       }) => {
  const inputClasses = `w-full border ${
      error ? "border-red-500" : "border-gray-300"
  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
      <div>
        <label className="block text-gray-700 mb-2" htmlFor={name}>
          {label}
        </label>
        {children || (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className={inputClasses}
            />
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
  );
};

const SelectField: FC<SelectFieldProps> = ({
                                             label,
                                             name,
                                             value,
                                             options,
                                             error,
                                             onChange,
                                           }) => {
  const selectClasses = `w-full border ${
      error ? "border-red-500" : "border-gray-300"
  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
      <div>
        <label className="block text-gray-700 mb-2" htmlFor={name}>
          {label}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={selectClasses}
        >
          {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
  );
};

const ProductSelector: FC<ProductSelectorProps> = ({
                                                     products,
                                                     currentItem,
                                                     errors,
                                                     getAvailableStock,
                                                     onChange,
                                                     onAdd,
                                                   }) => {
  const availableProducts = products.filter(
      (product) => product.quantity > 0 && product.isActive,
  );

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SelectField
            label="Product"
            name="productId"
            value={currentItem.productId}
            error={errors.productId}
            onChange={onChange}
            options={[
              { value: "", label: "Select Product" },
              ...availableProducts.map((product) => ({
                value: product.id,
                label: `${product.name} - $${product.sellingPrice.toFixed(2)} (${product.quantity} in stock)`,
              })),
            ]}
        />

        <FormField
            label="Quantity"
            name="quantity"
            value={currentItem.quantity}
            type="number"
            min="1"
            max={getAvailableStock(currentItem.productId).toString()}
            error={errors.quantity}
            onChange={onChange}
        />

        <div className="flex items-end">
          <button
              type="button"
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!currentItem.productId || currentItem.quantity <= 0}
          >
            Add to Sale
          </button>
        </div>
      </div>
  );
};

const SaleItemsTable: FC<SaleItemsTableProps> = ({
                                                   saleItems,
                                                   onRemove,
                                                   error,
                                                 }) => (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="font-medium mb-2">Items in Sale</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

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
                    <td className="py-2 px-4 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                    <td className="py-2 px-4 text-right font-medium">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                          onClick={() => onRemove(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
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
          <p className="text-gray-500 text-center py-4">
            No items added to sale yet
          </p>
      )}
    </div>
);

const SaleSummary: FC<SaleSummaryProps> = ({
                                             selectedCustomer,
                                             paymentMethod,
                                             taxRate,
                                             discountPercent,
                                             calculations,
                                             errors,
                                             customers,
                                             onCustomerChange,
                                             onPaymentMethodChange,
                                             onTaxChange,
                                             onDiscountChange,
                                           }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Sale Summary</h2>

      <div className="mb-4">
        <SelectField
            label="Customer"
            name="customer"
            value={selectedCustomer}
            onChange={onCustomerChange}
            options={customers.map((customer) => ({
              value: customer.id,
              label: customer.name,
            }))}
        />
      </div>

      <div className="mb-4">
        <SelectField
            label="Payment Method"
            name="paymentMethod"
            value={paymentMethod}
            error={errors.paymentMethod}
            onChange={onPaymentMethodChange}
            options={PAYMENT_METHODS.map((method) => ({
              value: method,
              label: method,
            }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormField
            label="Tax (%)"
            name="taxRate"
            value={taxRate}
            type="number"
            min="0"
            max="100"
            step="0.1"
            onChange={onTaxChange}
        />
        <FormField
            label="Discount (%)"
            name="discount"
            value={discountPercent}
            type="number"
            min="0"
            max="100"
            step="0.1"
            onChange={onDiscountChange}
        />
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">${calculations.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%):</span>
          <span>${calculations.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount ({discountPercent}%):</span>
          <span>-${calculations.discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total:</span>
          <span>${calculations.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
);

// Main Component
const NewSalePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products } = useSelector((state: RootState) => state.products);
  const { customers } = useSelector((state: RootState) => state.customers);

  // Filter only active customers for the dropdown
  const activeCustomers = useMemo(() =>
          customers.filter(customer => customer.isActive),
      [customers]
  );

  const {
    saleItems,
    currentItem,
    errors,
    handleItemChange,
    addItemToSale,
    removeItem,
    getAvailableStock,
    setErrors,
  } = useItemManagement(products);

  const {
    selectedCustomer,
    paymentMethod,
    taxRate,
    discountPercent,
    handleTaxChange,
    handleDiscountChange,
    handleCustomerChange,
    handlePaymentMethodChange,
  } = useSaleForm('walk-in');

  const calculations = useSaleCalculations(saleItems, taxRate, discountPercent);

  const validateSale = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (saleItems.length === 0) {
      newErrors.items = "Add at least one item to the sale";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [saleItems, paymentMethod, setErrors]);

  const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault();

        if (validateSale()) {
          const customer = activeCustomers.find((c) => c.id === selectedCustomer);
          if (!customer) return;

          const newSale: NewSale = {
            id: `SALE-${Date.now()}`,
            customerId: selectedCustomer,
            customerName: customer.name,
            items: saleItems,
            ...calculations,
            taxRate,
            discountPercent,
            paymentMethod,
            status: "Completed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add the sale
          dispatch(addSale(newSale));

          // Update customer purchase statistics (skip for walk-in customers)
          if (selectedCustomer !== 'walk-in') {
            dispatch(updateCustomerPurchaseStats({
              customerId: selectedCustomer,
              purchaseAmount: calculations.totalAmount
            }));
          }

          navigate(`/sales/receipt/${newSale.id}`);
        }
      },
      [
        validateSale,
        selectedCustomer,
        activeCustomers,
        saleItems,
        calculations,
        taxRate,
        discountPercent,
        paymentMethod,
        dispatch,
        navigate,
      ],
  );

  const handleCancel = useCallback(() => {
    navigate("/sales");
  }, [navigate]);

  return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">New Sale</h1>
          <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add Products</h2>

              <ProductSelector
                  products={products}
                  currentItem={currentItem}
                  errors={errors}
                  getAvailableStock={getAvailableStock}
                  onChange={handleItemChange}
                  onAdd={addItemToSale}
              />

              <SaleItemsTable
                  saleItems={saleItems}
                  onRemove={removeItem}
                  error={errors.items}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <SaleSummary
                selectedCustomer={selectedCustomer}
                paymentMethod={paymentMethod}
                taxRate={taxRate}
                discountPercent={discountPercent}
                calculations={calculations}
                errors={errors}
                customers={activeCustomers}
                onCustomerChange={handleCustomerChange}
                onPaymentMethodChange={handlePaymentMethodChange}
                onTaxChange={handleTaxChange}
                onDiscountChange={handleDiscountChange}
            />

            <div className="mt-6">
              <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={saleItems.length === 0}
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default NewSalePage;