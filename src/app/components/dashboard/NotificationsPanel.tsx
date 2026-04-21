import { X, Check, AlertCircle, TrendingUp, Package, MessageSquare, Settings as SettingsIcon, Clock, XCircle, CreditCard } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState } from 'react';
import { BidAcceptedOrderConfirmationModal } from './BidAcceptedOrderConfirmationModal';

interface Notification {
  id: string;
  type: 'bid' | 'order' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export function NotificationsPanel() {
  const [showBidAcceptedModal, setShowBidAcceptedModal] = useState(false);
  const [isBidNotificationVisible, setIsBidNotificationVisible] = useState(true);
  const [isSliding, setIsSliding] = useState(false);
  const [showRejectionNotification, setShowRejectionNotification] = useState(false);
  const [showPaymentCompleteNotification, setShowPaymentCompleteNotification] = useState(false);

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'bid',
      title: 'New Bid Received',
      message: 'Ramesh Trading Co. placed a bid of ₹2,30,000 on your Wheat listing',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Confirmation Pending',
      message: 'Please confirm your purchase for Cotton - Bt Cotton within 24 hours',
      timestamp: '6 hours ago',
      read: false
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      message: 'Priya Sharma sent you a message about Rice - Basmati listing',
      timestamp: '1 day ago',
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Completion',
      message: 'Complete your KYC verification to unlock all platform features',
      timestamp: '2 days ago',
      read: true
    },
    {
      id: '6',
      type: 'bid',
      title: 'Outbid Alert',
      message: 'You have been outbid on Rice - Basmati 1121. Current bid: ₹3,850',
      timestamp: '3 days ago',
      read: true
    },
    {
      id: '7',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order for Maize - Golden Corn has been successfully delivered',
      timestamp: '5 days ago',
      read: true
    },
    {
      id: '8',
      type: 'message',
      title: 'New Message',
      message: 'Amit Patel replied to your inquiry about bulk cotton purchase',
      timestamp: '1 week ago',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return <TrendingUp className="w-5 h-5 text-[#64b900]" />;
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <SettingsIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'bid':
        return 'bg-[#64b900]/10';
      case 'order':
        return 'bg-blue-50';
      case 'message':
        return 'bg-purple-50';
      case 'system':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  const unreadCount = (isBidNotificationVisible ? 1 : 0) + (showRejectionNotification ? 1 : 0) + (showPaymentCompleteNotification ? 1 : 0) + 2; // Dynamic count based on visible notifications

  const handleConfirmPurchaseClick = () => {
    setShowBidAcceptedModal(true);
  };

  const handleBidNotificationClose = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsBidNotificationVisible(false);
      setIsSliding(false);
      // Simulate sending rejection notification to seller
      setShowRejectionNotification(true);
    }, 300);
  };

  const handlePaymentComplete = () => {
    // Simulate sending payment completion notification to seller
    setShowPaymentCompleteNotification(true);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-[#64b900] text-white rounded-full text-xs font-['Geologica:Regular',sans-serif] font-medium">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#64b900] text-white rounded-lg text-xs font-['Geologica:Regular',sans-serif] font-medium">
            All
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-['Geologica:Regular',sans-serif] font-medium hover:bg-gray-200 transition-colors">
            Unread
          </button>
          <button className="ml-auto px-3 py-1.5 text-[#64b900] text-xs font-['Geologica:Regular',sans-serif] font-medium hover:underline">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {/* Special Bid Accepted Notification with Action Buttons */}
        {isBidNotificationVisible && (
          <div
            className={`px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 ${
              isSliding ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-[#64b900] flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    Bid Accepted
                  </h3>
                  <div className="w-2 h-2 bg-[#64b900] rounded-full flex-shrink-0 mt-1.5"></div>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 mb-3">
                  Your bid of ₹25,500 for Wheat - Durum has been accepted by the seller
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                  <button 
                    onClick={handleConfirmPurchaseClick}
                    className="px-4 py-2 bg-[#64b900] text-white rounded-lg text-xs font-['Geologica:Regular',sans-serif] font-medium hover:bg-[#559900] transition-colors"
                  >
                    Confirm Purchase
                  </button>
                  <button 
                    onClick={handleBidNotificationClose}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-['Geologica:Regular',sans-serif] font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 font-['Geologica:Regular',sans-serif]">
                    <Clock className="w-3 h-3" />
                    <span>4 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Notification for Seller */}
        {showRejectionNotification && (
          <div className="px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
            <div className="flex gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-red-900">
                    Order Purchase Rejected
                  </h3>
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></div>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-red-800 mb-3">
                  The buyer has rejected the purchase for <strong>Wheat - Durum</strong> at <strong>₹25,500</strong>. The listing is now available for other interested buyers.
                </p>
                
                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-red-700 font-['Geologica:Regular',sans-serif] font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Just now</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Complete Notification for Seller */}
        {showPaymentCompleteNotification && (
          <div className="px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-green-900">
                    Payment Received in Escrow
                  </h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-green-800 mb-3">
                  The buyer has successfully completed the escrow payment of <strong>₹25,500</strong> for <strong>Wheat - Durum (100 quintals)</strong>. The funds are securely held in escrow and will be released to you after the buyer confirms delivery.
                </p>
                
                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-green-700 font-['Geologica:Regular',sans-serif] font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Just now</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Notifications */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer
              ${!notification.read ? 'bg-blue-50/30' : ''}
            `}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full ${getNotificationBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-['Geologica:Regular',sans-serif] text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-[#64b900] rounded-full flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-2 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-['Geologica:Regular',sans-serif]">
                  <Clock className="w-3 h-3" />
                  <span>{notification.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bid Accepted Order Confirmation Modal */}
      <BidAcceptedOrderConfirmationModal
        isOpen={showBidAcceptedModal}
        onClose={() => setShowBidAcceptedModal(false)}
        onConfirm={() => {
          setShowBidAcceptedModal(false);
          // The modal handles the escrow payment flow internally
        }}
        onPaymentComplete={handlePaymentComplete}
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