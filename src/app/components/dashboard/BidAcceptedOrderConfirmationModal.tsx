import { useState } from 'react';
import { X, Package, MapPin, Calendar, Truck, ShieldCheck, CreditCard, Building2, Wallet, AlertCircle, Check } from 'lucide-react';
import { EscrowPaymentPage } from '../escrow/EscrowPaymentPage';

interface BidAcceptedOrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onViewOrderStatus?: () => void;
  onGoToDashboard?: () => void;
  onPaymentComplete?: () => void;
  order: {
    cropName: string;
    variety: string;
    quantity: number;
    unit: string;
    acceptedBidAmount: number;
    sellerName: string;
    sellerLocation: string;
    pickupMethod: string;
    expectedDelivery: string;
    productImage?: string;
  };
}

export function BidAcceptedOrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onViewOrderStatus,
  onGoToDashboard,
  onPaymentComplete,
  order
}: BidAcceptedOrderConfirmationModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showEscrowPayment, setShowEscrowPayment] = useState(false);

  if (!isOpen) return null;

  // Skip the confirmation modal and go directly to escrow payment
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Container for Escrow Payment - Full size with scroll */}
      <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl border-2 border-black/10 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <EscrowPaymentPage
            orderDetails={{
              productName: order.cropName,
              variety: order.variety,
              quantity: order.quantity,
              unit: order.unit,
              pricePerUnit: order.acceptedBidAmount / order.quantity,
              totalPrice: order.acceptedBidAmount,
              sellerName: order.sellerName,
              sellerLocation: order.sellerLocation,
              expectedDelivery: order.expectedDelivery,
              productImage: order.productImage || 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080'
            }}
            onCancel={() => {
              onClose();
              onConfirm();
            }}
            onViewOrderStatus={onViewOrderStatus}
            onGoToDashboard={onGoToDashboard}
            onPaymentComplete={onPaymentComplete}
          />
        </div>
      </div>
    </div>
  );
}