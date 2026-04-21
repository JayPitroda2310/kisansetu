import { X, AlertCircle } from 'lucide-react';

interface AcceptBidConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bid: {
    bidderName: string;
    bidderCompany: string;
    amount: number;
  };
  listing: {
    cropName: string;
    variety: string;
    quantity: number;
    unit: string;
  };
}

export function AcceptBidConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  bid,
  listing,
}: AcceptBidConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900">
            Confirm Buyer Selection
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bid Details Card */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                  Buyer
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                  {bid.bidderCompany}
                </p>
              </div>
              <div className="text-right">
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                  Bid Amount
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-[#64b900]">
                  ₹{bid.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-0.5">
                Listing
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                {listing.cropName} {listing.variety} • {listing.quantity} {listing.unit}
              </p>
            </div>
          </div>

          {/* Information Alert */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-900 leading-relaxed">
              You are about to accept this buyer's bid. The buyer will be notified and must confirm 
              the purchase before payment is initiated.
            </p>
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
            onClick={onConfirm}
            className="px-5 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium shadow-lg shadow-[#64b900]/20"
          >
            Accept & Notify Buyer
          </button>
        </div>
      </div>
    </div>
  );
}
