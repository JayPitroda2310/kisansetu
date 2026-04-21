import { CheckCircle2 } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onViewOrderStatus: () => void;
  order: {
    cropName: string;
    variety: string;
    totalAmount: number;
  };
}

export function PaymentSuccessModal({
  isOpen,
  onViewOrderStatus,
  order,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#64b900]/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#64b900]" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="font-['Fraunces',sans-serif] text-2xl text-gray-900">
              Payment Successful
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-base text-gray-600 leading-relaxed">
              Your payment of{' '}
              <span className="font-bold text-[#64b900]">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
              {' '}has been securely placed in escrow.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Commodity
              </span>
              <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                {order.cropName} {order.variety}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Status
              </span>
              <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-[#64b900] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#64b900] rounded-full animate-pulse"></span>
                Payment Secured
              </span>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-900 leading-relaxed">
              The seller will now prepare the shipment. You'll be notified at each step of the delivery process.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onViewOrderStatus}
            className="w-full px-6 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm shadow-lg shadow-[#64b900]/20"
          >
            View Order Status
          </button>

          {/* Secondary Action */}
          <button
            onClick={onViewOrderStatus}
            className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
