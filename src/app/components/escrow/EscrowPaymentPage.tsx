import { useState } from 'react';
import { Shield, CheckCircle, Package, MapPin, Calendar, CreditCard, Smartphone, Building2, ChevronRight, X, Lock, AlertCircle } from 'lucide-react';
import { EscrowSuccessScreen } from './EscrowSuccessScreen';
import { createEscrowTransaction } from '../../utils/supabase/escrow';
import { supabase } from '../../utils/supabase/client';

interface OrderDetails {
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  sellerName: string;
  sellerId?: string; // Optional seller UUID
  sellerLocation: string;
  expectedDelivery: string;
  productImage: string;
  listingId?: string; // Optional listing ID to mark as sold after payment
}

interface EscrowPaymentPageProps {
  orderDetails: OrderDetails;
  onCancel?: () => void;
  onViewOrderStatus?: () => void;
  onGoToDashboard?: () => void;
  onPaymentComplete?: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';

export function EscrowPaymentPage({ orderDetails, onCancel, onViewOrderStatus, onGoToDashboard, onPaymentComplete }: EscrowPaymentPageProps) {
  const [currentScreen, setCurrentScreen] = useState<'selectPayment' | 'confirmPayment' | 'success'>('selectPayment');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  const platformFee = orderDetails.totalPrice * 0.02; // 2% platform fee
  const gst = (orderDetails.totalPrice + platformFee) * 0.18; // 18% GST
  const totalAmount = orderDetails.totalPrice + platformFee + gst;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const generateOTP = () => {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateOrderId = () => {
    // Generate order ID in format #ORD-2024-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `#ORD-2024-${randomNum}`;
  };

  const handlePayment = () => {
    if (!termsAccepted) return;
    setCurrentScreen('confirmPayment');
  };

  const handleConfirmPayment = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please login to continue');
        return;
      }

      console.log('🟢 EscrowPaymentPage: Starting payment with orderDetails:', {
        sellerId: orderDetails.sellerId,
        sellerName: orderDetails.sellerName,
        productName: orderDetails.productName,
        buyerId: user.id
      });

      // Validate sellerId
      if (!orderDetails.sellerId) {
        console.error('❌ No sellerId provided in orderDetails!');
        alert('Invalid seller information. Please try again.');
        return;
      }

      // Create escrow transaction in Supabase
      const { data, error } = await createEscrowTransaction({
        sellerId: orderDetails.sellerId, // Use actual seller UUID - no fallback!
        sellerName: orderDetails.sellerName,
        productName: orderDetails.productName,
        productVariety: orderDetails.variety,
        quantity: orderDetails.quantity,
        unit: orderDetails.unit,
        pricePerUnit: orderDetails.pricePerUnit,
        totalPrice: orderDetails.totalPrice,
        sellerLocation: orderDetails.sellerLocation,
        expectedDelivery: orderDetails.expectedDelivery,
        productImage: orderDetails.productImage,
        paymentMethod: selectedPayment,
        listingId: orderDetails.listingId // Pass listing ID to mark as sold
      });

      if (error || !data) {
        console.error('Error creating escrow transaction:', error);
        alert('Payment failed. Please try again.');
        return;
      }

      console.log('✅ Escrow transaction created:', data);

      // Set the generated values from Supabase
      setGeneratedOTP(data.delivery_otp);
      setGeneratedOrderId(data.order_id);
      
      // Show success screen
      setTimeout(() => {
        setCurrentScreen('success');
        if (onPaymentComplete) onPaymentComplete();
      }, 500);
    } catch (error) {
      console.error('Error in handleConfirmPayment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  // Success Screen
  if (currentScreen === 'success') {
    return (
      <EscrowSuccessScreen 
        orderDetails={orderDetails} 
        totalAmount={totalAmount} 
        transactionId={`TXN${Date.now()}`} 
        orderId={generatedOrderId}
        otp={generatedOTP}
        onClose={onCancel} 
        onViewOrderStatus={onViewOrderStatus} 
        onGoToDashboard={onGoToDashboard} 
      />
    );
  }

  // Confirm Payment Screen
  if (currentScreen === 'confirmPayment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b-2 border-black/10 px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#64b900] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-['Fraunces',sans-serif] text-2xl text-black">
                  Confirm Payment
                </h1>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Securely complete your transaction
                </p>
              </div>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Escrow Protection Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-['Fraunces',sans-serif] text-lg text-blue-900 mb-1">
                  🔒 Secure Escrow Protection Active
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-800" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Your payment will be held securely in escrow until you confirm receipt of goods. The seller will be notified once payment is received.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Order Summary
              </h2>

              {/* Product Image & Details */}
              <div className="flex gap-4 pb-4 mb-4 border-b-2 border-black/10">
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

              {/* Seller & Delivery Info */}
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
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Payment Details
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b-2 border-black/10">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Order Amount</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formatCurrency(orderDetails.totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Platform Fee (2%)</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formatCurrency(platformFee)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>GST (18%)</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formatCurrency(gst)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Total Amount</span>
                <span className="font-['Fraunces',sans-serif] text-3xl text-[#64b900] font-bold">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="bg-gradient-to-r from-[#64b900]/10 to-[#64b900]/5 border-2 border-[#64b900]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-[#64b900]" />
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Payment Method</span>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80 uppercase font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedPayment === 'upi' ? 'UPI Payment' : selectedPayment === 'card' ? 'Credit/Debit Card' : 'Net Banking'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setCurrentScreen('selectPayment')}
              className="flex-1 px-6 py-4 border-2 border-black/10 text-black rounded-xl hover:bg-black/5 transition-colors font-['Geologica:Regular',sans-serif] text-base font-semibold"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Back
            </button>
            <button
              onClick={handleConfirmPayment}
              className="flex-1 px-6 py-4 bg-[#64b900] text-white rounded-xl hover:bg-[#558a00] transition-colors font-['Geologica:Regular',sans-serif] text-base font-semibold shadow-lg flex items-center justify-center gap-2"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              <Lock className="w-5 h-5" />
              Confirm & Pay {formatCurrency(totalAmount)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Method Selection Screen (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#64b900] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Secure Escrow Payment
              </h1>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Your payment is protected until delivery confirmation
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details & Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Order Details
              </h2>

              <div className="flex gap-4 pb-4 mb-4 border-b-2 border-black/10">
                <div className="w-24 h-24 bg-gradient-to-br from-[#64b900]/20 to-[#64b900]/10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-black/10">
                  <img
                    src={orderDetails.productImage}
                    alt={orderDetails.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Geologica:Regular',sans-serif] text-lg text-black font-semibold mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {orderDetails.productName} - {orderDetails.variety}
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {orderDetails.quantity} {orderDetails.unit} × {formatCurrency(orderDetails.pricePerUnit)}/{orderDetails.unit}
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xl text-[#64b900] font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {formatCurrency(orderDetails.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller</p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.sellerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location</p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.sellerLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 col-span-2">
                  <Calendar className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Expected Delivery</p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{orderDetails.expectedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Protection Info */}
            <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-2xl border-2 border-[#64b900]/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#64b900] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-['Fraunces',sans-serif] text-lg text-black">
                  How Escrow Protects You
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] flex-shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Payment is held securely by KisanSetu platform
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] flex-shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Seller is notified once escrow payment is confirmed
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] flex-shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Funds released only after you confirm delivery
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] flex-shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    48 hours window to raise quality concerns after delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* UPI */}
                <button
                  onClick={() => setSelectedPayment('upi')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === 'upi'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-black/10 hover:border-[#64b900]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedPayment === 'upi' ? 'bg-[#64b900]' : 'bg-black/5'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        selectedPayment === 'upi' ? 'text-white' : 'text-black/60'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>UPI Payment</p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Google Pay, PhonePe, Paytm
                      </p>
                    </div>
                  </div>
                  {selectedPayment === 'upi' && (
                    <CheckCircle className="w-6 h-6 text-[#64b900]" />
                  )}
                </button>

                {/* Card */}
                <button
                  onClick={() => setSelectedPayment('card')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === 'card'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-black/10 hover:border-[#64b900]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedPayment === 'card' ? 'bg-[#64b900]' : 'bg-black/5'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        selectedPayment === 'card' ? 'text-white' : 'text-black/60'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Credit/Debit Card
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Visa, Mastercard, RuPay
                      </p>
                    </div>
                  </div>
                  {selectedPayment === 'card' && (
                    <CheckCircle className="w-6 h-6 text-[#64b900]" />
                  )}
                </button>

                {/* Net Banking */}
                <button
                  onClick={() => setSelectedPayment('netbanking')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === 'netbanking'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-black/10 hover:border-[#64b900]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedPayment === 'netbanking' ? 'bg-[#64b900]' : 'bg-black/5'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        selectedPayment === 'netbanking' ? 'text-white' : 'text-black/60'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Net Banking
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        All major banks supported
                      </p>
                    </div>
                  </div>
                  {selectedPayment === 'netbanking' && (
                    <CheckCircle className="w-6 h-6 text-[#64b900]" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-2xl border-2 border-black/10 p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#64b900] border-2 border-black/30 rounded focus:ring-[#64b900] cursor-pointer"
                />
                <label htmlFor="terms" className="font-['Geologica:Regular',sans-serif] text-sm text-black/80 cursor-pointer" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  I agree to the{' '}
                  <a href="#" className="text-[#64b900] underline font-semibold">Terms & Conditions</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#64b900] underline font-semibold">Privacy Policy</a>.
                  I understand that my payment will be held in escrow until I confirm receipt of goods. I have 48 hours from delivery to raise any quality concerns.
                </label>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-900" />
                </div>
                <div>
                  <h3 className="font-['Fraunces',sans-serif] text-base text-yellow-900 mb-2">
                    Important Notice
                  </h3>
                  <ul className="font-['Geologica:Regular',sans-serif] text-sm text-yellow-900 space-y-1.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    <li>• Payment will be processed through secure escrow gateway</li>
                    <li>• Seller will be notified after payment confirmation</li>
                    <li>• Confirm receipt within 48 hours after delivery</li>
                    <li>• Funds will be released to seller after your confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg sticky top-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-5">
                Payment Summary
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b-2 border-black/10">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Order Amount</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {formatCurrency(orderDetails.totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Platform Fee (2%)</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {formatCurrency(platformFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>GST (18%)</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {formatCurrency(gst)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Total Amount
                </span>
                <span className="font-['Fraunces',sans-serif] text-3xl text-[#64b900] font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!termsAccepted}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-['Geologica:Regular',sans-serif] text-base font-semibold shadow-lg ${
                  termsAccepted
                    ? 'bg-[#64b900] text-white hover:bg-[#558a00] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <Lock className="w-5 h-5" />
                Pay Securely into Escrow
                <ChevronRight className="w-5 h-5" />
              </button>

              <p className="font-['Geologica:Regular',sans-serif] text-xs text-center text-black/60 mt-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                🔒 Your funds will be held securely until delivery confirmation
              </p>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full mt-3 py-3 border-2 border-black/10 text-black rounded-xl hover:bg-black/5 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}