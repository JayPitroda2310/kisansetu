import { Check, X } from 'lucide-react';

interface BidAcceptedNotificationCardProps {
  notification: {
    id: string;
    sellerName: string;
    cropName: string;
    variety: string;
    bidAmount: number;
    listingId: string;
  };
  onConfirm: () => void;
  onDecline: () => void;
}

export function BidAcceptedNotificationCard({
  notification,
  onConfirm,
  onDecline,
}: BidAcceptedNotificationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-[#64b900]/20 p-6 space-y-4">
      {/* Header with Icon */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#64b900]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🎉</span>
        </div>
        <div className="flex-1">
          <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 mb-1">
            Bid Accepted
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Great news! Your bid has been accepted by the seller.
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
        <div className="flex justify-between">
          <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Seller:
          </span>
          <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
            {notification.sellerName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Commodity:
          </span>
          <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
            {notification.cropName} {notification.variety}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Bid Amount:
          </span>
          <span className="font-['Geologica:Regular',sans-serif] text-sm font-bold text-[#64b900]">
            ₹{notification.bidAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Listing ID:
          </span>
          <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
            {notification.listingId}
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-900 leading-relaxed">
          The seller has accepted your bid. Please confirm if you want to proceed with the purchase.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm shadow-lg shadow-[#64b900]/20"
        >
          Confirm Purchase
        </button>
        <button
          onClick={onDecline}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-['Geologica:SemiBold',sans-serif] text-sm"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
