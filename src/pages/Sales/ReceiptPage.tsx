import  { FC, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { RootState } from '../../store';
import {Sale} from "../../store/slices/salesSlice";

// Types and Interfaces
interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}


interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
}

// Constants
const COMPANY_INFO: CompanyInfo = {
  name: 'Inventory & POS System',
  address: '123 Business Street',
  city: 'Anytown, ST 12345',
  phone: '(123) 456-7890'
};

// Utility Functions
const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Custom Hooks
const usePrintReceipt = (sale: Sale | undefined) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${sale?.id || 'Not-Found'}`,
  });
  return { receiptRef, handlePrint };
};

// Components
interface NotFoundMessageProps {
  onBackToSales: () => void;
}

const NotFoundMessage: FC<NotFoundMessageProps> = ({ onBackToSales }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h2 className="text-xl font-bold mb-2">Receipt Not Found</h2>
        <p>The receipt you're looking for doesn't exist or has been deleted.</p>
        <button
            onClick={onBackToSales}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Back to Sales
        </button>
      </div>
    </div>
);

interface PageHeaderProps {
  onBackToSales: () => void;
  onPrint: () => void;
}

const PageHeader: FC<PageHeaderProps> = ({ onBackToSales, onPrint }) => (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">Receipt</h1>
      <div className="flex space-x-3">
        <button
            onClick={onBackToSales}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Sales
        </button>
        <button
            onClick={onPrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Print Receipt
        </button>
      </div>
    </div>
);

interface CompanyHeaderProps {
  companyInfo: CompanyInfo;
}

const CompanyHeader: FC<CompanyHeaderProps> = ({ companyInfo }) => (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
      <p className="text-gray-600">{companyInfo.address}</p>
      <p className="text-gray-600">{companyInfo.city}</p>
      <p className="text-gray-600">Phone: {companyInfo.phone}</p>
    </div>
);

interface ReceiptInfoProps {
  sale: Sale;
}

const ReceiptInfo: FC<ReceiptInfoProps> = ({ sale }) => (
    <div className="border-t border-b border-gray-200 py-4 mb-6">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">Receipt No:</span>
        <span>{sale.id}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-semibold">Date:</span>
        <span>{formatDate(sale.createdAt)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Customer:</span>
        <span>{sale.customerName}</span>
      </div>
    </div>
);

interface ItemsTableProps {
  items: SaleItem[];
}

const ItemsTable: FC<ItemsTableProps> = ({ items }) => (
    <table className="w-full mb-6">
      <thead>
      <tr className="border-b border-gray-200">
        <th className="text-left py-2">Item</th>
        <th className="text-right py-2">Price</th>
        <th className="text-right py-2">Qty</th>
        <th className="text-right py-2">Total</th>
      </tr>
      </thead>
      <tbody>
      {items.map((item, index) => (
          <tr key={index} className="border-b border-gray-100">
            <td className="py-2">{item.productName}</td>
            <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
            <td className="py-2 text-right">{item.quantity}</td>
            <td className="py-2 text-right">{formatCurrency(item.totalPrice)}</td>
          </tr>
      ))}
      </tbody>
    </table>
);

interface SummaryRowProps {
  label: string;
  value: string;
  isBold?: boolean;
  hasBorder?: boolean;
}

const SummaryRow: FC<SummaryRowProps> = ({
                                           label,
                                           value,
                                           isBold = false,
                                           hasBorder = false
                                         }) => (
    <div className={`flex justify-between ${isBold ? 'text-lg font-bold' : ''} ${
        hasBorder ? 'border-t border-gray-200 pt-2 mt-2' : 'mb-2'
    }`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
);

interface TotalsSectionProps {
  sale: Sale;
}

const TotalsSection: FC<TotalsSectionProps> = ({ sale }) => (
    <div className="border-t border-gray-200 pt-4">
      <SummaryRow
          label="Subtotal:"
          value={formatCurrency(sale.subtotal)}
      />

      {sale.taxAmount > 0 && (
          <SummaryRow
              label={`Tax (${sale.taxRate}%):`}
              value={formatCurrency(sale.taxAmount)}
          />
      )}

      {sale.discountAmount > 0 && (
          <SummaryRow
              label={`Discount (${sale.discountPercent}%):`}
              value={`-${formatCurrency(sale.discountAmount)}`}
          />
      )}

      <SummaryRow
          label="Total:"
          value={formatCurrency(sale.totalAmount)}
          isBold={true}
          hasBorder={true}
      />

      <div className="flex justify-between mt-2">
        <span className="font-medium">Payment Method:</span>
        <span>{sale.paymentMethod}</span>
      </div>
    </div>
);

interface ThankYouSectionProps {
  isVoided: boolean;
}

const ThankYouSection: FC<ThankYouSectionProps> = ({ isVoided }) => (
    <div className="text-center mt-8 pt-6 border-t border-gray-200">
      <p className="font-medium">Thank you for your business!</p>
      <p className="text-sm text-gray-600 mt-2">Please keep this receipt for your records.</p>
      {isVoided && (
          <p className="text-xs text-red-600 font-bold mt-4">
            *** THIS RECEIPT HAS BEEN VOIDED ***
          </p>
      )}
    </div>
);

interface ReceiptContentProps {
  sale: Sale;
  receiptRef: React.RefObject<HTMLDivElement>;
}

const ReceiptContent: FC<ReceiptContentProps> = ({ sale, receiptRef }) => (
    <div
        className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto"
        ref={receiptRef}
    >
      <CompanyHeader companyInfo={COMPANY_INFO} />
      <ReceiptInfo sale={sale} />
      <ItemsTable items={sale.items} />
      <TotalsSection sale={sale} />
      <ThankYouSection isVoided={sale.status === 'Voided'} />
    </div>
);

// Main Component
const ReceiptPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get sale data from Redux store
  const { sales } = useSelector((state: RootState) => state.sales);
  const sale = sales.find((s: Sale) => s.id === id);

  const { receiptRef, handlePrint } = usePrintReceipt(sale);

  const handleBackToSales = useCallback(() => {
    navigate('/sales');
  }, [navigate]);

  // If the sale doesn't exist, show a not found message
  if (!sale) {
    return <NotFoundMessage onBackToSales={handleBackToSales} />;
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
            onBackToSales={handleBackToSales}
            onPrint={handlePrint}
        />
        <ReceiptContent
            sale={sale}
            receiptRef={receiptRef}
        />
      </div>
  );
};

export default ReceiptPage;