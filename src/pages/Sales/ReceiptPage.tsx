import { FC, useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import { RootState } from '../../store';


const ReceiptPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef();

  // Get sale data from Redux store
  const { sales } = useSelector((state: RootState) => state.sales);
  const sale = sales.find((s) => s.id === id);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${sale?.id || 'Not-Found'}`,
  });

  // If the sale doesn't exist, show a not found message
  if (!sale) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-xl font-bold mb-2">Receipt Not Found</h2>
          <p>The receipt you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/sales')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receipt</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/sales')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Sales
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Print Receipt
          </button>
        </div>
      </div>

      {/* Receipt Content - This will be printed */}
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto" ref={receiptRef}>
        {/* Receipt Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Inventory & POS System</h2>
          <p className="text-gray-600">123 Business Street</p>
          <p className="text-gray-600">Anytown, ST 12345</p>
          <p className="text-gray-600">Phone: (123) 456-7890</p>
        </div>

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

        {/* Items Table */}
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
            {sale.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">{item.productName}</td>
                <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${sale.subtotal.toFixed(2)}</span>
          </div>
          {sale.taxAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Tax ({sale.taxRate}%):</span>
              <span>${sale.taxAmount.toFixed(2)}</span>
            </div>
          )}
          {sale.discountAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Discount ({sale.discountPercent}%):</span>
              <span>-${sale.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
            <span>Total:</span>
            <span>${sale.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-medium">Payment Method:</span>
            <span>{sale.paymentMethod}</span>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="font-medium">Thank you for your business!</p>
          <p className="text-sm text-gray-600 mt-2">Please keep this receipt for your records.</p>
          <p className="text-xs text-gray-500 mt-4">
            {sale.status === 'Voided' && '*** THIS RECEIPT HAS BEEN VOIDED ***'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;