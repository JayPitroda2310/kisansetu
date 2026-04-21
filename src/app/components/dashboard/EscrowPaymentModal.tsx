import { X, CreditCard, Building2, Wallet, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  order: {
    cropName: string;
    variety: string;
    sellerName: string;
    totalAmount: number;
  };
}

type PaymentMethod = 'upi' | 'netbanking' | 'wallet' | null;

export function EscrowPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  order,
}: EscrowPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'upi' as PaymentMethod,
      name: 'UPI',
      icon: CreditCard,
      description: 'Pay using UPI apps',
    },
    {
      id: 'netbanking' as PaymentMethod,
      name: 'Net Banking',
      icon: Building2,
      description: 'Pay via your bank',
    },
    {
      id: 'wallet' as PaymentMethod,
      name: 'Wallet',
      icon: Wallet,
      description: 'Digital wallet payment',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900">
            Secure Escrow Payment
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-xl p-4 border-2 border-[#64b900]/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                  Commodity
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                  {order.cropName} {order.variety}
                </p>
              </div>
              <div className="text-right">
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                  Total Amount
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xl font-bold text-[#64b900]">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#64b900]/20">
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                Seller
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                {order.sellerName}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-3">
              Select Payment Method
            </h4>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={isProcessing}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                    selectedMethod === method.id
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id
                      ? 'bg-[#64b900] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900">
                      {method.name}
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">
                      {method.description}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#64b900]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <div className="text-lg">🔒</div>
            <div>
              <p className="font-['Geologica:SemiBold',sans-serif] text-xs text-blue-900 mb-0.5">
                Secure Payment
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800">
                256-bit SSL encryption ensures your payment details are safe
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="px-6 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm font-medium shadow-lg shadow-[#64b900]/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Pay to Escrow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
