import {ChangeEvent, FC, ReactNode, useCallback, useMemo, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {deleteInventoryItem, InventoryItem, updateInventoryItem} from '../../store/slices/inventorySlice';
import {AppDispatch, RootState} from "../../store";


interface EditFormData {
  name: string;
  quantity: number;
  costPerUnit: number;
  unit: string;
  reorderLevel: number;
}

type SortField = keyof Pick<InventoryItem, 'name' | 'sku' | 'quantity' | 'unit' | 'costPerUnit' | 'reorderLevel'>;
type SortDirection = 'asc' | 'desc';

// Custom Hooks
const useInventoryFiltering = (inventory: InventoryItem[], searchTerm: string, sortField: SortField, sortDirection: SortDirection) => {
  return useMemo(() => {
    return inventory
        .filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
          } else {
            const numA = Number(aValue);
            const numB = Number(bValue);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
          }
        });
  }, [inventory, searchTerm, sortField, sortDirection]);
};

const useInventoryEdit = (dispatch: AppDispatch) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    quantity: 0,
    costPerUnit: 0,
    unit: '',
    reorderLevel: 0
  });

  const handleEdit = useCallback((item: InventoryItem) => {
    setEditingItem(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      costPerUnit: item.costPerUnit,
      unit: item.unit,
      reorderLevel: item.reorderLevel
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'unit' ? value : parseFloat(value) || 0
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (editingItem) {
      dispatch(updateInventoryItem({ id: editingItem, ...formData }));
      setEditingItem(null);
    }
  }, [editingItem, formData, dispatch]);

  const handleCancel = useCallback(() => {
    setEditingItem(null);
  }, []);

  return {
    editingItem,
    formData,
    handleEdit,
    handleInputChange,
    handleSave,
    handleCancel
  };
};

// Components
interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className = "h-64" }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
);

interface EditableCellProps {
  isEditing: boolean;
  name: keyof EditFormData;
  value: string | number;
  displayValue: ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
  className?: string;
  inputClassName?: string;
}

const EditableCell: FC<EditableCellProps> = ({
                                               isEditing,
                                               name,
                                               value,
                                               displayValue,
                                               onChange,
                                               type = "text",
                                               step,
                                               className = "",
                                               inputClassName = "border border-gray-300 rounded px-2 py-1"
                                             }) => (
    <td className={`py-2 px-4 border-b ${className}`}>
      {isEditing ? (
          <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              step={step}
              className={inputClassName}
          />
      ) : (
          displayValue
      )}
    </td>
);

interface SortableHeaderProps {
  field: SortField;
  children: ReactNode;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

const SortableHeader: FC<SortableHeaderProps> = ({
                                                   field,
                                                   children,
                                                   currentSortField,
                                                   sortDirection,
                                                   onSort,
                                                   className = "text-left"
                                                 }) => (
    <th
        className={`py-2 px-4 border-b cursor-pointer ${className}`}
        onClick={() => onSort(field)}
    >
      {children} {currentSortField === field && (sortDirection === 'asc' ? '▲' : '▼')}
    </th>
);

interface InventoryTableRowProps {
  item: InventoryItem;
  isEditing: boolean;
  formData: EditFormData;
  onEdit: (item: InventoryItem) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InventoryTableRow: FC<InventoryTableRowProps> = ({
                                                         item,
                                                         isEditing,
                                                         formData,
                                                         onEdit,
                                                         onSave,
                                                         onCancel,
                                                         onDelete,
                                                         onInputChange
                                                       }) => {
  const isLowStock = item.quantity <= item.reorderLevel;
  const totalValue = (item.quantity * item.costPerUnit).toFixed(2);

  return (
      <tr className="hover:bg-gray-50">
        <EditableCell
            isEditing={isEditing}
            name="name"
            value={formData.name}
            displayValue={item.name}
            onChange={onInputChange}
            inputClassName="border border-gray-300 rounded px-2 py-1 w-full"
        />

        <td className="py-2 px-4 border-b">{item.sku}</td>

        <EditableCell
            isEditing={isEditing}
            name="quantity"
            value={formData.quantity}
            displayValue={
              <span className={isLowStock ? "text-red-600 font-medium" : ""}>
            {item.quantity}
          </span>
            }
            onChange={onInputChange}
            type="number"
            className="text-right"
            inputClassName="border border-gray-300 rounded px-2 py-1 w-20 text-right"
        />

        <EditableCell
            isEditing={isEditing}
            name="unit"
            value={formData.unit}
            displayValue={item.unit}
            onChange={onInputChange}
            className="text-center"
            inputClassName="border border-gray-300 rounded px-2 py-1 w-20 text-center"
        />

        <EditableCell
            isEditing={isEditing}
            name="costPerUnit"
            value={formData.costPerUnit}
            displayValue={`$${item.costPerUnit.toFixed(2)}`}
            onChange={onInputChange}
            type="number"
            step="0.01"
            className="text-right"
            inputClassName="border border-gray-300 rounded px-2 py-1 w-24 text-right"
        />

        <EditableCell
            isEditing={isEditing}
            name="reorderLevel"
            value={formData.reorderLevel}
            displayValue={item.reorderLevel}
            onChange={onInputChange}
            type="number"
            className="text-right"
            inputClassName="border border-gray-300 rounded px-2 py-1 w-20 text-right"
        />

        <td className="py-2 px-4 border-b text-right font-medium">
          ${totalValue}
        </td>

        <td className="py-2 px-4 border-b">
          <div className="flex justify-center space-x-2">
            {isEditing ? (
                <>
                  <button
                      onClick={onSave}
                      className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Save
                  </button>
                  <button
                      onClick={onCancel}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </>
            ) : (
                <>
                  <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </>
            )}
          </div>
        </td>
      </tr>
  );
};

// Main Component
const InventoryPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { inventory, loading } = useSelector((state: RootState) => state.inventory);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const {
    editingItem,
    formData,
    handleEdit,
    handleInputChange,
    handleSave,
    handleCancel
  } = useInventoryEdit(dispatch);

  const filteredInventory = useInventoryFiltering(inventory, searchTerm, sortField, sortDirection);

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((total, item) => {
      return total + (item.quantity * item.costPerUnit);
    }, 0).toFixed(2);
  }, [inventory]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
       dispatch(deleteInventoryItem(id));
    }
  }, [dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
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
                  onChange={handleSearchChange}
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
                <SortableHeader
                    field="name"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                >
                  Name
                </SortableHeader>
                <SortableHeader
                    field="sku"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                >
                  SKU
                </SortableHeader>
                <SortableHeader
                    field="quantity"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-right"
                >
                  Quantity
                </SortableHeader>
                <SortableHeader
                    field="unit"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-center"
                >
                  Unit
                </SortableHeader>
                <SortableHeader
                    field="costPerUnit"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-right"
                >
                  Cost Per Unit
                </SortableHeader>
                <SortableHeader
                    field="reorderLevel"
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-right"
                >
                  Reorder Level
                </SortableHeader>
                <th className="py-2 px-4 border-b text-right">Total Value</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                      <InventoryTableRow
                          key={item.id}
                          item={item}
                          isEditing={editingItem === item.id}
                          formData={formData}
                          onEdit={handleEdit}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onDelete={handleDelete}
                          onInputChange={handleInputChange}
                      />
                  ))
              ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      {searchTerm
                          ? 'No inventory items match your search.'
                          : 'No inventory items found. Add some items to get started.'
                      }
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