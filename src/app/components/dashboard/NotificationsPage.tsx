import { useState } from 'react';
import { Bell, ShoppingBag, CreditCard, MessageSquare, User, Lock, Check, Clock, AlertCircle } from 'lucide-react';
import { BidAcceptedOrderConfirmationModal } from './BidAcceptedOrderConfirmationModal';

export function NotificationsPage() {
  const [showBidAcceptedModal, setShowBidAcceptedModal] = useState(false);
  const [isBidNotificationVisible, setIsBidNotificationVisible] = useState(true);
  const [isSliding, setIsSliding] = useState(false);

  const handleConfirmPurchaseClick = () => {
    setShowBidAcceptedModal(true);
  };

  const handleRejectBid = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsBidNotificationVisible(false);
      setIsSliding(false);
    }, 300); // Match the animation duration
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900">Notifications</h1>
        <button className="text-sm text-[#64b900] hover:underline font-medium">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {/* Bid Accepted Notification - Featured */}
        {isBidNotificationVisible && (
          <div 
            className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-500/30 p-6 shadow-lg transition-all duration-300 ${
              isSliding ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-['Fraunces',sans-serif] text-xl text-green-900">
                    🎉 Your Bid Has Been Accepted!
                  </h3>
                  <button className="text-green-700 hover:text-green-900">
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-green-800 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  The seller has accepted your bid for <strong>Wheat - Durum</strong> at <strong>₹25,500</strong>. Please confirm your purchase within 24 hours to proceed with the order.
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleConfirmPurchaseClick}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-['Geologica:Regular',sans-serif] text-sm shadow-md" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Confirm Purchase
                  </button>
                  <button 
                    onClick={handleRejectBid}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-['Geologica:Regular',sans-serif] text-sm shadow-md" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Reject
                  </button>
                  <div className="ml-auto flex items-center gap-2 text-green-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      23h 45m remaining
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Order Notification */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-[#64b900]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900 mb-1">New order received</p>
                  <p className="text-sm text-gray-600 mb-2">You have a new order for Basmati Rice (50kg)</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
                <span className="w-2.5 h-2.5 bg-[#64b900] rounded-full flex-shrink-0 mt-1.5"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Notification */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900 mb-1">Payment received</p>
                  <p className="text-sm text-gray-600 mb-2">₹12,500 received for order #12345</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
                <span className="w-2.5 h-2.5 bg-[#64b900] rounded-full flex-shrink-0 mt-1.5"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Notification */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-['Geologica:SemiBold',sans-serif] text-base text-gray-900 mb-1">New message from Priya Sharma</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-2">Interested in your wheat listing...</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">3 hours ago</p>
                </div>
                <span className="w-2.5 h-2.5 bg-[#64b900] rounded-full flex-shrink-0 mt-1"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Alert Notification */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 mb-1">Price alert</p>
              <p className="text-sm text-gray-600 mb-2">Wheat prices increased by 5% in your region</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
        </div>

        {/* Order Delivered */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-[#64b900]" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 mb-1">Order delivered</p>
              <p className="text-sm text-gray-600 mb-2">Your order #12340 has been delivered successfully</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>

        {/* Review Request */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 mb-1">Review request</p>
              <p className="text-sm text-gray-600 mb-2">Please review your recent purchase from Amit Kumar</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>

        {/* KYC Verification */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-[#64b900]" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900 mb-1">KYC verification successful</p>
              <p className="text-sm text-gray-600 mb-2">Your account has been verified</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Accepted Order Confirmation Modal */}
      <BidAcceptedOrderConfirmationModal
        isOpen={showBidAcceptedModal}
        onClose={() => setShowBidAcceptedModal(false)}
        onConfirm={() => {
          setShowBidAcceptedModal(false);
          // The modal handles the escrow payment flow internally
        }}
        order={{
          cropName: 'Wheat',
          variety: 'Durum',
          quantity: 100,
          unit: 'quintals',
          acceptedBidAmount: 25500,
          sellerName: 'Rajesh Kumar',
          sellerLocation: 'Punjab, India',
          pickupMethod: 'Farm Pickup',
          expectedDelivery: 'March 25, 2026'
        }}
      />
    </div>
  );
}