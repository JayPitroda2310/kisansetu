import { X, Lock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
  order: {
    cropName: string;
    variety: string;
    sellerName: string;
    quantity: number;
    unit: string;
    bidAmount: number;
    platformFee: number;
    image: string;
  };
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  onProceedToPayment,
  order,
}: OrderConfirmationModalProps) {
  if (!isOpen) return null;

  const totalPayable = order.bidAmount + order.platformFee;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-['Fraunces',sans-serif] text-2xl text-gray-900">
            Confirm Purchase
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product & Seller Info */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left - Image */}
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden bg-gray-100 h-48">
                <ImageWithFallback
                  src={order.image}
                  alt={order.cropName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-gray-900">
                  {order.cropName} {order.variety}
                </h4>
              </div>
            </div>

            {/* Right - Details */}
            <div className="space-y-4">
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-1">
                  Seller
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                  {order.sellerName}
                </p>
              </div>

              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-1">
                  Quantity
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                  {order.quantity} {order.unit}
                </p>
              </div>

              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-1">
                  Bid Amount
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-[#64b900]">
                  ₹{order.bidAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Payment Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-3">
              Payment Summary
            </h4>
            
            <div className="flex justify-between">
              <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Bid Amount
              </span>
              <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                ₹{order.bidAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Platform Fee (1%)
              </span>
              <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                ₹{order.platformFee.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-['Geologica:Regular',sans-serif] text-base font-bold text-gray-900">
                Total Payable
              </span>
              <span className="font-['Geologica:Regular',sans-serif] text-xl font-bold text-[#64b900]">
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Escrow Security Message */}
          <div className="flex gap-3 p-4 bg-green-50 border-2 border-[#64b900]/30 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#64b900]/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-[#64b900]" />
            </div>
            <div>
              <h5 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-1">
                🔒 Secure Escrow Payment
              </h5>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 leading-relaxed">
                Your payment will be securely held in escrow until delivery is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onProceedToPayment}
            className="px-6 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm font-medium shadow-lg shadow-[#64b900]/20"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
