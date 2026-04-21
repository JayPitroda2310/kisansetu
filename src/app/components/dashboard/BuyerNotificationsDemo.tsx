import { useState } from 'react';
import { BidAcceptedNotificationCard } from './BidAcceptedNotificationCard';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { EscrowPaymentModal } from './EscrowPaymentModal';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  sellerName: string;
  cropName: string;
  variety: string;
  bidAmount: number;
  listingId: string;
  quantity: number;
  unit: string;
  platformFee: number;
  image: string;
}

export function BuyerNotificationsDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmingOrder, setConfirmingOrder] = useState<Notification | null>(null);
  const [processingPayment, setProcessingPayment] = useState<Notification | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<Notification | null>(null);

  // This will be called from seller side in production
  const handleBidAcceptedFromSeller = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleConfirmPurchase = (notification: Notification) => {
    setConfirmingOrder(notification);
  };

  const handleDecline = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleProceedToPayment = () => {
    if (confirmingOrder) {
      setProcessingPayment(confirmingOrder);
      setConfirmingOrder(null);
    }
  };

  const handlePaymentSuccess = () => {
    if (processingPayment) {
      setPaymentSuccess(processingPayment);
      setProcessingPayment(null);
      setNotifications(prev => prev.filter(n => n.id !== processingPayment.id));
    }
  };

  const handleViewOrderStatus = () => {
    setPaymentSuccess(null);
    // Navigate to order status page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#64b900]" />
            Notifications
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mt-1">
            Bids accepted by sellers
          </p>
        </div>
        {notifications.length > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-[#64b900] text-white font-['Geologica:SemiBold',sans-serif] text-xs">
            {notifications.length} New
          </span>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <BidAcceptedNotificationCard
              key={notification.id}
              notification={notification}
              onConfirm={() => handleConfirmPurchase(notification)}
              onDecline={() => handleDecline(notification.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900 mb-2">
            No new notifications
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            When sellers accept your bids, they'll appear here
          </p>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {confirmingOrder && (
        <OrderConfirmationModal
          isOpen={!!confirmingOrder}
          onClose={() => setConfirmingOrder(null)}
          onProceedToPayment={handleProceedToPayment}
          order={{
            cropName: confirmingOrder.cropName,
            variety: confirmingOrder.variety,
            sellerName: confirmingOrder.sellerName,
            quantity: confirmingOrder.quantity,
            unit: confirmingOrder.unit,
            bidAmount: confirmingOrder.bidAmount,
            platformFee: confirmingOrder.platformFee,
            image: confirmingOrder.image,
          }}
        />
      )}

      {/* Escrow Payment Modal */}
      {processingPayment && (
        <EscrowPaymentModal
          isOpen={!!processingPayment}
          onClose={() => setProcessingPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
          order={{
            cropName: processingPayment.cropName,
            variety: processingPayment.variety,
            sellerName: processingPayment.sellerName,
            totalAmount: processingPayment.bidAmount + processingPayment.platformFee,
          }}
        />
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <PaymentSuccessModal
          isOpen={!!paymentSuccess}
          onViewOrderStatus={handleViewOrderStatus}
          order={{
            cropName: paymentSuccess.cropName,
            variety: paymentSuccess.variety,
            totalAmount: paymentSuccess.bidAmount + paymentSuccess.platformFee,
          }}
        />
      )}
    </div>
  );
}
