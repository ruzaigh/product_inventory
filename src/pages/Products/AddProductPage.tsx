import {useState, useEffect, FC, useMemo, useCallback, ChangeEvent, FormEvent} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../../store/slices/productSlice';
import {AppDispatch, RootState} from "../../store";

// Types and Interfaces
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  sellingPrice: number;
  quantity: number;
  isActive: boolean;
}

interface Material {
  inventoryItemId: string;
  quantity: number;
}

interface FormErrors {
  [key: string]: string | null;
}

interface NewProduct extends ProductFormData {
  id: string;
  productionCost: number;
  materials: Material[];
  createdAt: string;
  updatedAt: string;
}

// Constants
const INITIAL_FORM_DATA: ProductFormData = {
  name: '',
  description: '',
  sku: '',
  sellingPrice: 0,
  quantity: 0,
  isActive: true,
};

const INITIAL_MATERIAL: Material = {
  inventoryItemId: '',
  quantity: 1
};
interface ProfitSummaryProps {
  productionCost: number;
  sellingPrice: number;
  profitPerItem: number;
  profitMargin: number;
}

// Components
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
  helpText?: string;
  prefix?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  helpText?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface MaterialsTableProps {
  materials: Material[];
  getInventoryItemName: (id: string) => string;
  getMaterialCost: (material: Material) => number;
  onRemove: (index: number) => void;
  totalCost: number;
}

// Custom Hooks
const useProductCalculations = (materials: Material[], inventory: InventoryItem[], sellingPrice: number) => {
  const productionCost = useMemo(() => {
    return materials.reduce((cost, material) => {
      const inventoryItem = inventory.find(item => item.id === material.inventoryItemId);
      return inventoryItem ? cost + (inventoryItem.costPerUnit * material.quantity) : cost;
    }, 0);
  }, [materials, inventory]);

  const profitMargin = useMemo(() => {
    if (sellingPrice > 0) {
      return ((sellingPrice - productionCost) / sellingPrice) * 100;
    }
    return 0;
  }, [sellingPrice, productionCost]);

  const profitPerItem = useMemo(() => {
    return sellingPrice - productionCost;
  }, [sellingPrice, productionCost]);

  return { productionCost, profitMargin, profitPerItem };
};

const useMaterialManagement = (inventory: InventoryItem[]) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<Material>(INITIAL_MATERIAL);
  const [materialErrors, setMaterialErrors] = useState<FormErrors>({});

  const handleMaterialChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentMaterial(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (parseInt(value) || 0) : value
    }));
  }, []);

  const addMaterial = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!currentMaterial.inventoryItemId) {
      newErrors.materialId = 'Please select a material';
    }

    if (currentMaterial.quantity <= 0) {
      newErrors.materialQuantity = 'Quantity must be greater than zero';
    }

    if (Object.keys(newErrors).length > 0) {
      setMaterialErrors(newErrors);
      return;
    }

    setMaterials(prev => {
      const existingIndex = prev.findIndex(m => m.inventoryItemId === currentMaterial.inventoryItemId);

      if (existingIndex >= 0) {
        // Update existing material quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + currentMaterial.quantity
        };
        return updated;
      } else {
        // Add new material
        return [...prev, { ...currentMaterial }];
      }
    });

    setCurrentMaterial(INITIAL_MATERIAL);
    setMaterialErrors({});
  }, [currentMaterial]);

  const removeMaterial = useCallback((index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getInventoryItemName = useCallback((id: string) => {
    const item = inventory.find(item => item.id === id);
    return item ? item.name : 'Unknown Item';
  }, [inventory]);

  const getMaterialCost = useCallback((material: Material) => {
    const item = inventory.find(i => i.id === material.inventoryItemId);
    return item ? item.costPerUnit * material.quantity : 0;
  }, [inventory]);

  return {
    materials,
    currentMaterial,
    materialErrors,
    handleMaterialChange,
    addMaterial,
    removeMaterial,
    getInventoryItemName,
    getMaterialCost
  };
};

const useProductForm = () => {
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = useCallback((fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [errors]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    let parsedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      parsedValue = target.checked;
    } else if (name === 'quantity') {
      parsedValue = parseInt(value) || 0;
    } else if (name === 'sellingPrice') {
      parsedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    clearFieldError(name);
  }, [clearFieldError]);

  const validateForm = useCallback((materials: Material[]): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than zero';
    if (materials.length === 0) newErrors.materials = 'At least one material is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    handleChange,
    validateForm
  };
};



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
                                         helpText,
                                         prefix,
                                         onChange
                                       }) => {
  const inputClasses = `w-full border ${
      error ? 'border-red-500' : 'border-gray-300'
  } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      prefix ? 'pl-8' : ''
  }`;

  return (
      <div>
        <label className="block text-gray-700 mb-2" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {prefix && <span className="absolute left-3 top-2 text-gray-500">{prefix}</span>}
          {type === 'textarea' ? (
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
          )}
        </div>
        {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
        {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
      </div>
  );
};


const CheckboxField: FC<CheckboxFieldProps> = ({ label, name, checked, helpText, onChange }) => (
    <div className="mt-6">
      <div className="flex items-center">
        <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor={name} className="ml-2 block text-gray-700">
          {label}
        </label>
      </div>
      {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
    </div>
);

interface MaterialSelectorProps {
  inventory: InventoryItem[];
  currentMaterial: Material;
  errors: FormErrors;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAdd: () => void;
}

const MaterialSelector: FC<MaterialSelectorProps> = ({
                                                       inventory,
                                                       currentMaterial,
                                                       errors,
                                                       onChange,
                                                       onAdd
                                                     }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-gray-700 mb-2" htmlFor="inventoryItemId">
          Material
        </label>
        <select
            id="inventoryItemId"
            name="inventoryItemId"
            value={currentMaterial.inventoryItemId}
            onChange={onChange}
            className={`w-full border ${
                errors.materialId ? 'border-red-500' : 'border-gray-300'
            } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
        <label className="block text-gray-700 mb-2" htmlFor="materialQuantity">
          Quantity
        </label>
        <input
            type="number"
            id="materialQuantity"
            name="quantity"
            value={currentMaterial.quantity}
            onChange={onChange}
            className={`w-full border ${
                errors.materialQuantity ? 'border-red-500' : 'border-gray-300'
            } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            min="1"
        />
        {errors.materialQuantity && <p className="text-red-500 mt-1 text-sm">{errors.materialQuantity}</p>}
      </div>

      <div className="flex items-end">
        <button
            type="button"
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Material
        </button>
      </div>
    </div>
);


const MaterialsTable: FC<MaterialsTableProps> = ({
                                                   materials,
                                                   getInventoryItemName,
                                                   getMaterialCost,
                                                   onRemove,
                                                   totalCost
                                                 }) => (
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
                      onClick={() => onRemove(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
          <tfoot>
          <tr>
            <td colSpan={2} className="pt-2 text-right font-medium">Total Production Cost:</td>
            <td colSpan={2} className="pt-2 text-right font-bold">${totalCost.toFixed(2)}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>
);


const ProfitSummary: FC<ProfitSummaryProps> = ({
                                                 productionCost,
                                                 sellingPrice,
                                                 profitPerItem,
                                                 profitMargin
                                               }) => (
    <div className="mt-6 bg-blue-50 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 font-medium">Production Cost: ${productionCost.toFixed(2)}</p>
          <p className="text-gray-700 font-medium">Selling Price: ${sellingPrice.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-700 font-medium">Profit per Item: ${profitPerItem.toFixed(2)}</p>
          <p className="text-gray-700 font-medium">
            Profit Margin: <span className={profitMargin < 0 ? 'text-red-600' : 'text-green-600'}>
            {profitMargin.toFixed(1)}%
          </span>
          </p>
        </div>
      </div>
    </div>
);

// Main Component
const AddProductPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { inventory } = useSelector((state: RootState) => state.inventory);

  const { formData, errors, handleChange, validateForm } = useProductForm();
  const {
    materials,
    currentMaterial,
    materialErrors,
    handleMaterialChange,
    addMaterial,
    removeMaterial,
    getInventoryItemName,
    getMaterialCost
  } = useMaterialManagement(inventory);

  const { productionCost, profitMargin, profitPerItem } = useProductCalculations(
      materials,
      inventory,
      formData.sellingPrice
  );

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm(materials)) {
      const newProduct: NewProduct = {
        ...formData,
        id: Date.now().toString(),
        productionCost,
        materials,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(addProduct(newProduct));
      navigate('/products');
    }
  }, [formData, materials, productionCost, validateForm, dispatch, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Products
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                  placeholder="Enter product name"
              />

              <FormField
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  error={errors.sku}
                  placeholder="e.g. PROD-001"
              />

              <FormField
                  label="Selling Price"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  type="number"
                  onChange={handleChange}
                  required
                  error={errors.sellingPrice}
                  min="0"
                  step="0.01"
                  prefix="$"
              />

              <FormField
                  label="Initial Quantity"
                  name="quantity"
                  value={formData.quantity}
                  type="number"
                  onChange={handleChange}
                  min="0"
                  helpText="Optional: Initial stock quantity"
              />
            </div>

            <div className="mt-6">
              <FormField
                  label="Description"
                  name="description"
                  value={formData.description}
                  type="textarea"
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={3}
              />
            </div>

            <CheckboxField
                label="Active Product"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                helpText="Inactive products won't show up in sales"
            />

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Material Requirements</h2>
              <p className={`mb-4 ${errors.materials ? 'text-red-500' : 'text-gray-500'}`}>
                Add materials required to make this product
              </p>
              {errors.materials && <p className="text-red-500 mb-4 text-sm">{errors.materials}</p>}

              <MaterialSelector
                  inventory={inventory}
                  currentMaterial={currentMaterial}
                  errors={materialErrors}
                  onChange={handleMaterialChange}
                  onAdd={addMaterial}
              />

              {materials.length > 0 && (
                  <MaterialsTable
                      materials={materials}
                      getInventoryItemName={getInventoryItemName}
                      getMaterialCost={getMaterialCost}
                      onRemove={removeMaterial}
                      totalCost={productionCost}
                  />
              )}
            </div>

            <ProfitSummary
                productionCost={productionCost}
                sellingPrice={formData.sellingPrice}
                profitPerItem={profitPerItem}
                profitMargin={profitMargin}
            />

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