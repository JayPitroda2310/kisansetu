import { Shield, X, AlertCircle } from 'lucide-react';

interface OrderDetails {
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  sellerName: string;
  sellerLocation: string;
  expectedDelivery: string;
  productImage: string;
}

interface EscrowConfirmationModalProps {
  orderDetails: OrderDetails;
  totalAmount: number;
  paymentMethod: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EscrowConfirmationModal({
  orderDetails,
  totalAmount,
  paymentMethod,
  onConfirm,
  onCancel,
}: EscrowConfirmationModalProps) {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'card':
        return 'Credit/Debit Card';
      case 'netbanking':
        return 'Net Banking';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[1200px] w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#64b900]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#64b900]" />
            </div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl font-bold text-gray-900">
              Confirm Payment
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Escrow Notice */}
          <div className="bg-[#64b900]/5 border border-[#64b900]/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#64b900] shrink-0 mt-0.5" />
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-1">
                Secure Escrow Payment
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-700">
                Your payment will be held securely in escrow until delivery confirmation. 
                The seller will be notified once your payment is received.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900 mb-3">
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                  <img 
                    src={orderDetails.productImage} 
                    alt={orderDetails.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                    {orderDetails.productName} - {orderDetails.variety}
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    {orderDetails.quantity} {orderDetails.unit}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Seller:</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                    {orderDetails.sellerName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Location:</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                    {orderDetails.sellerLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Expected Delivery:</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                    {orderDetails.expectedDelivery}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900 mb-3">
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Payment Method:</span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                  {getPaymentMethodLabel(paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] font-bold text-2xl text-[#64b900]">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold shadow-lg"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}