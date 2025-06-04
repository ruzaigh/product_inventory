import { FC, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  Product,
  updateProduct,
} from "../../store/slices/productSlice";
import { AppDispatch, RootState } from "../../store";

// Types and Interfaces
interface EditFormData {
  name: string;
  sellingPrice: number;
}

type SortField = keyof Pick<
  Product,
  "name" | "sku" | "quantity" | "productionCost" | "sellingPrice"
>;
type SortDirection = "asc" | "desc";

interface ProductMetrics {
  totalProducts: number;
  totalProductionCost: string;
  totalPotentialProfit: string;
  totalMarketValue: string;
}

// Components
interface LoadingSpinnerProps {
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  valueClassName?: string;
}

interface EditableCellProps {
  isEditing: boolean;
  name?: keyof EditFormData;
  value: string | number;
  displayValue: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
  className?: string;
  inputClassName?: string;
}

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

interface ProfitMarginProps {
  productionCost: number;
  sellingPrice: number;
}

interface ProductTableRowProps {
  product: Product;
  isEditing: boolean;
  formData: EditFormData;
  onEdit: (product: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface MetricsDashboardProps {
  metrics: ProductMetrics;
}

interface SearchAndSummaryProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalMarketValue: string;
}

// Custom Hooks
const useProductFiltering = (
  products: Product[],
  searchTerm: string,
  sortField: SortField,
  sortDirection: SortDirection,
) => {
  return useMemo(() => {
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          const numA = Number(aValue);
          const numB = Number(bValue);
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }
      });
  }, [products, searchTerm, sortField, sortDirection]);
};

const useProductMetrics = (products: Product[]): ProductMetrics => {
  return useMemo(() => {
    const totalProductionCost = products
      .reduce(
        (total, product) => total + product.quantity * product.productionCost,
        0,
      )
      .toFixed(2);

    const totalPotentialProfit = products
      .reduce(
        (total, product) =>
          total +
          product.quantity * (product.sellingPrice - product.productionCost),
        0,
      )
      .toFixed(2);

    const totalMarketValue = products
      .reduce(
        (total, product) => total + product.quantity * product.sellingPrice,
        0,
      )
      .toFixed(2);

    return {
      totalProducts: products.length,
      totalProductionCost,
      totalPotentialProfit,
      totalMarketValue,
    };
  }, [products]);
};

const useProductEdit = (dispatch: AppDispatch) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    sellingPrice: 0,
  });

  const handleEdit = useCallback((product: Product) => {
    setEditingItem(product.id);
    setFormData({
      name: product.name,
      sellingPrice: product.sellingPrice,
    });
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === "name" ? value : parseFloat(value) || 0,
      }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (editingItem) {
      dispatch(updateProduct({ id: editingItem, ...formData }));
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
    handleCancel,
  };
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className = "h-64" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div
      className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  valueClassName = "",
}) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
    <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
  </div>
);

const EditableCell: FC<EditableCellProps> = ({
  isEditing,
  name,
  value,
  displayValue,
  onChange,
  type = "text",
  step,
  className = "",
  inputClassName = "border border-gray-300 rounded px-2 py-1",
}) => (
  <td className={`py-2 px-4 border-b ${className}`}>
    {isEditing && name && onChange ? (
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

const SortableHeader: FC<SortableHeaderProps> = ({
  field,
  children,
  currentSortField,
  sortDirection,
  onSort,
  className = "text-left",
}) => (
  <th
    className={`py-2 px-4 border-b cursor-pointer ${className}`}
    onClick={() => onSort(field)}
  >
    {children}{" "}
    {currentSortField === field && (sortDirection === "asc" ? "▲" : "▼")}
  </th>
);

const ProfitMargin: FC<ProfitMarginProps> = ({
  productionCost,
  sellingPrice,
}) => {
  const margin = ((sellingPrice - productionCost) / sellingPrice) * 100;
  const colorClass =
    margin < 15
      ? "text-red-600"
      : margin < 30
        ? "text-yellow-600"
        : "text-green-600";

  return (
    <span className={`font-medium ${colorClass}`}>{margin.toFixed(1)}%</span>
  );
};

const ProductTableRow: FC<ProductTableRowProps> = ({
  product,
  isEditing,
  formData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onInputChange,
}) => {
  const isOutOfStock = product.quantity === 0;

  return (
    <tr className="hover:bg-gray-50">
      <EditableCell
        isEditing={isEditing}
        name="name"
        value={formData.name}
        displayValue={product.name}
        onChange={onInputChange}
        inputClassName="border border-gray-300 rounded px-2 py-1 w-full"
      />

      <td className="py-2 px-4 border-b">{product.sku}</td>

      <td className="py-2 px-4 border-b text-right">
        <span className={isOutOfStock ? "text-red-600 font-medium" : ""}>
          {product.quantity}
        </span>
      </td>

      <td className="py-2 px-4 border-b text-right">
        ${product.productionCost.toFixed(2)}
      </td>

      <EditableCell
        isEditing={isEditing}
        name="sellingPrice"
        value={formData.sellingPrice}
        displayValue={`$${product.sellingPrice.toFixed(2)}`}
        onChange={onInputChange}
        type="number"
        step="0.01"
        className="text-right"
        inputClassName="border border-gray-300 rounded px-2 py-1 w-24 text-right"
      />

      <td className="py-2 px-4 border-b text-right">
        <ProfitMargin
          productionCost={product.productionCost}
          sellingPrice={product.sellingPrice}
        />
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
                onClick={() => onEdit(product)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(product.id)}
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

const MetricsDashboard: FC<MetricsDashboardProps> = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <MetricCard title="Total Products" value={metrics.totalProducts} />
    <MetricCard
      title="Total Production Cost"
      value={`$${metrics.totalProductionCost}`}
      valueClassName="text-red-600"
    />
    <MetricCard
      title="Potential Profit"
      value={`$${metrics.totalPotentialProfit}`}
      valueClassName="text-green-600"
    />
  </div>
);

const SearchAndSummary: FC<SearchAndSummaryProps> = ({
  searchTerm,
  onSearchChange,
  totalMarketValue,
}) => (
  <div className="flex flex-wrap items-center justify-between mb-4">
    <div className="w-full md:w-auto mb-4 md:mb-0">
      <input
        type="text"
        placeholder="Search products..."
        className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
    <div className="flex items-center">
      <span className="mr-2 text-gray-700">Total Market Value:</span>
      <span className="font-bold text-lg">${totalMarketValue}</span>
    </div>
  </div>
);

// Main Component
const ProductsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const {
    editingItem,
    formData,
    handleEdit,
    handleInputChange,
    handleSave,
    handleCancel,
  } = useProductEdit(dispatch);

  const filteredProducts = useProductFiltering(
    products,
    searchTerm,
    sortField,
    sortDirection,
  );
  const metrics = useProductMetrics(products);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this product? This action cannot be undone.",
        )
      ) {
        dispatch(deleteProduct(id));
      }
    },
    [dispatch],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  if (loading) {
    return <LoadingSpinner />;
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

      <MetricsDashboard metrics={metrics} />

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <SearchAndSummary
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalMarketValue={metrics.totalMarketValue}
        />

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
                  Product Name
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
                  field="productionCost"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                >
                  Production Cost
                </SortableHeader>
                <SortableHeader
                  field="sellingPrice"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                >
                  Selling Price
                </SortableHeader>
                <th className="py-2 px-4 border-b text-right">Profit Margin</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    isEditing={editingItem === product.id}
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
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    {searchTerm
                      ? "No products match your search."
                      : "No products found. Create some products to get started."}
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
