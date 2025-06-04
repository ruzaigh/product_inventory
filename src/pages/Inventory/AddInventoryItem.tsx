import {ChangeEvent, FC, FormEvent, ReactNode, useCallback, useState} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addInventoryItem,
} from "../../store/slices/inventorySlice";
import { AppDispatch } from "../../store";

interface InventoryFormData {
  name: string;
  description: string;
  sku: string;
  quantity: number;
  costPerUnit: number;
  unit: string;
  category: string;
  reorderLevel: number;
}

interface FormErrors {
  [key: string]: string | null;
}

interface NewInventoryItem extends InventoryFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
const UNITS = [
  "pcs",
  "kg",
  "g",
  "l",
  "ml",
  "box",
  "carton",
  "pack",
  "bottle",
  "roll",
  "sheet",
  "yard",
  "meter",
  "inch",
  "cm",
] as const;

const CATEGORIES = [
  "Raw Materials",
  "Ingredients",
  "Packaging",
  "Office Supplies",
  "Cleaning Supplies",
  "Tools",
  "Other",
] as const;

const INITIAL_FORM_DATA: InventoryFormData = {
  name: "",
  description: "",
  sku: "",
  quantity: 0,
  costPerUnit: 0,
  unit: "pcs",
  category: "",
  reorderLevel: 5,
};

// Custom Hook for Form Management
const useInventoryForm = () => {
  const [formData, setFormData] = useState<InventoryFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = useCallback((fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [errors]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Parse numeric fields
    if (name === 'quantity' || name === 'reorderLevel') {
      parsedValue = parseInt(value) || 0;
    } else if (name === 'costPerUnit') {
      parsedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    clearFieldError(name);
  }, [clearFieldError]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.costPerUnit <= 0) newErrors.costPerUnit = 'Cost per unit must be greater than zero';
    if (formData.reorderLevel < 0) newErrors.reorderLevel = 'Reorder level cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    handleChange,
    validateForm,
  };
};

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  required?: boolean;
  error?: string | null;
  placeholder?: string;
  min?: string;
  step?: string;
  rows?: number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  children?: ReactNode;
}

const FormField: FC<FormFieldProps> = ({
                                         label,
                                         name,
                                         value,
                                         type = 'text',
                                         required = false,
                                         error,
                                         placeholder,
                                         min,
                                         step,
                                         rows,
                                         onChange,
                                         children
                                       }) => {
  const inputClasses = `w-full border ${
      error ? 'border-red-500' : 'border-gray-300'
  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
      <div>
        <label className="block text-gray-700 mb-2" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children || (
            type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={inputClasses}
                    rows={rows}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={inputClasses}
                    placeholder={placeholder}
                    min={min}
                    step={step}
                />
            )
        )}
        {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
      </div>
  );
};

// Main Component
const AddInventoryItem: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { formData, errors, handleChange, validateForm } = useInventoryForm();

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      const newItem: NewInventoryItem = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(addInventoryItem(newItem));
      navigate('/inventory');
    }
  }, [formData, validateForm, dispatch, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Add Inventory Item</h1>
          <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Inventory
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  label="Item Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                  placeholder="Enter item name"
              />

              <FormField
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  error={errors.sku}
                  placeholder="e.g. INV-001"
              />

              <FormField
                  label="Quantity"
                  name="quantity"
                  value={formData.quantity}
                  type="number"
                  onChange={handleChange}
                  required
                  error={errors.quantity}
                  min="0"
              />

              <FormField
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  error={errors.unit}
              >
                <div className="flex">
                  <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-3/4 border ${
                          errors.unit ? 'border-red-500' : 'border-gray-300'
                      } rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                    ))}
                  </select>
                  <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-1/4 border ${
                          errors.unit ? 'border-red-500' : 'border-gray-300'
                      } border-l-0 rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Custom"
                  />
                </div>
              </FormField>

              <FormField
                  label="Cost Per Unit"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  type="number"
                  onChange={handleChange}
                  required
                  error={errors.costPerUnit}
                  min="0"
                  step="0.01"
              >
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                      type="number"
                      id="costPerUnit"
                      name="costPerUnit"
                      value={formData.costPerUnit}
                      onChange={handleChange}
                      className={`w-full border ${
                          errors.costPerUnit ? 'border-red-500' : 'border-gray-300'
                      } rounded-md px-4 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      min="0"
                      step="0.01"
                  />
                </div>
              </FormField>

              <FormField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
              >
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                  ))}
                </select>
              </FormField>

              <FormField
                  label="Reorder Level"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  type="number"
                  onChange={handleChange}
                  required
                  error={errors.reorderLevel}
                  min="0"
              >
                <input
                    type="number"
                    id="reorderLevel"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    className={`w-full border ${
                        errors.reorderLevel ? 'border-red-500' : 'border-gray-300'
                    } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="0"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Minimum quantity before reordering is suggested
                </p>
              </FormField>
            </div>

            <div className="mt-6">
              <FormField
                  label="Description"
                  name="description"
                  value={formData.description}
                  type="textarea"
                  onChange={handleChange}
                  placeholder="Enter item description"
                  rows={4}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                  type="button"
                  onClick={handleCancel}
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