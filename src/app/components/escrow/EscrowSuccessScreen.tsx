import { CheckCircle, Package, Truck, Eye, ArrowRight, Download, Shield, Calendar, MapPin } from 'lucide-react';
import { OTPDeliveryCard } from './OTPDeliveryCard';

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

interface EscrowSuccessScreenProps {
  orderDetails: OrderDetails;
  totalAmount: number;
  transactionId?: string;
  orderId?: string;
  otp?: string;
  onClose?: () => void;
  onViewOrderStatus?: () => void;
  onGoToDashboard?: () => void;
}

export function EscrowSuccessScreen({ 
  orderDetails, 
  totalAmount,
  transactionId, 
  orderId,
  otp,
  onClose,
  onViewOrderStatus,
  onGoToDashboard 
}: EscrowSuccessScreenProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleViewOrderStatus = () => {
    if (onViewOrderStatus) {
      onViewOrderStatus();
    } else if (onClose) {
      onClose();
    }
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Success Header with Animation */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#64b900] to-[#558a00] mb-6 animate-bounce shadow-2xl">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-['Fraunces',sans-serif] text-5xl font-bold text-black mb-4">
            Payment Successfully Secured!
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-xl text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Your payment of <span className="text-[#64b900] font-bold">{formatCurrency(totalAmount)}</span> has been securely placed in escrow
          </p>
        </div>

        {/* OTP Delivery Card */}
        {otp && orderId && (
          <div className="mb-8">
            <OTPDeliveryCard
              otp={otp}
              orderId={orderId}
              onViewOrder={handleViewOrderStatus}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-5">
              Order Summary
            </h2>

            <div className="flex gap-4 pb-5 mb-5 border-b-2 border-black/10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#64b900]/20 to-[#64b900]/10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-black/10">
                <img
                  src={orderDetails.productImage}
                  alt={orderDetails.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {orderDetails.productName} - {orderDetails.variety}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {orderDetails.quantity} {orderDetails.unit}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.sellerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.sellerLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Expected Delivery</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.expectedDelivery}</p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black/10">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Amount Paid</span>
                  <span className="font-['Fraunces',sans-serif] text-2xl text-[#64b900] font-bold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-5">
              What Happens Next?
            </h2>

            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#64b900] flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    1. Seller Preparing Order
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {orderDetails.sellerName} has been notified and will prepare your shipment
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-black/40" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    2. Shipment & Tracking
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    You'll receive tracking details once the order is shipped
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-black/40" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    3. Confirm Delivery
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Confirm receipt to release payment to the seller
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Protection Notice */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl text-blue-900 mb-2">
                🔒 Protected by Secure Escrow
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-800 leading-relaxed" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Your funds are safely held in escrow by KisanSetu. Payment will only be released to the seller after you confirm that the goods have been delivered in satisfactory condition. You have 48 hours from delivery to raise any quality concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#64b900] text-white rounded-xl hover:bg-[#558a00] transition-all font-['Geologica:Regular',sans-serif] text-base font-semibold shadow-lg" 
            onClick={handleViewOrderStatus}
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            View Order Status
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            className="flex-1 py-4 border-2 border-black/10 text-black rounded-xl hover:bg-black/5 transition-all font-['Geologica:Regular',sans-serif] text-base font-semibold" 
            onClick={handleGoToDashboard}
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 text-center shadow-lg">
          <h3 className="font-['Fraunces',sans-serif] text-lg text-black mb-2">
            Need Help?
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Our support team is here to assist you
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="mailto:support@kisansetu.com" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#64b900] text-white rounded-xl hover:bg-[#558a00] transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              📧 support@kisansetu.com
            </a>
            <a 
              href="tel:+911234567890" 
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#64b900] text-[#64b900] rounded-xl hover:bg-[#64b900] hover:text-white transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              📞 +91 123 456 7890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}