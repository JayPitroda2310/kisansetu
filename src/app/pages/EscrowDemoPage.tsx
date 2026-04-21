import { useState } from 'react';
import { Shield, CheckCircle, Package, Truck, Eye, CreditCard, Smartphone, Building2, ChevronRight, X, AlertCircle, ArrowRight } from 'lucide-react';

// Sample order details for demo
const demoOrderDetails = {
  productName: 'Wheat',
  variety: 'HD-2967',
  quantity: 100,
  unit: 'Quintal',
  pricePerUnit: 2250,
  totalPrice: 225000,
  sellerName: 'Rajesh Kumar',
  sellerLocation: 'Meerut, Uttar Pradesh',
  expectedDelivery: '5-7 Business Days',
  productImage: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
};

type PaymentMethod = 'upi' | 'card' | 'netbanking';
type ViewState = 'payment' | 'success';

export default function EscrowDemoPage() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('payment');

  const platformFee = demoOrderDetails.totalPrice * 0.02;
  const totalAmount = demoOrderDetails.totalPrice + platformFee;

  const handlePayment = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      setViewState('success');
    }, 500);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'card':
        return 'Credit/Debit Card';
      case 'netbanking':
        return 'Net Banking';
      default:
        return method;
    }
  };

  // Success Screen
  if (viewState === 'success') {
    return (
      <div className="min-h-screen bg-[#fefaf0] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#64b900]/10 mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-[#64b900]" />
            </div>
            <h1 className="font-['Fraunces',sans-serif] text-4xl font-bold text-gray-900 mb-4">
              Payment Successfully Secured in Escrow
            </h1>
            <p className="font-['Geologica:Regular',sans-serif] text-lg text-gray-600 max-w-2xl mx-auto">
              Your payment has been secured in escrow. The seller has been notified and will now prepare your shipment.
            </p>
          </div>

          {/* Order Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img 
                  src={demoOrderDetails.productImage} 
                  alt={demoOrderDetails.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-xl text-gray-900 mb-1">
                  {demoOrderDetails.productName} - {demoOrderDetails.variety}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                  {demoOrderDetails.quantity} {demoOrderDetails.unit} from {demoOrderDetails.sellerName}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Order Amount:</span>
                <span className="font-['Geologica:Regular',sans-serif] font-semibold text-lg text-[#64b900]">
                  ₹{demoOrderDetails.totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Expected Delivery:</span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                  {demoOrderDetails.expectedDelivery}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="font-['Fraunces',sans-serif] text-2xl font-semibold text-gray-900 mb-6">
              What Happens Next?
            </h2>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#64b900] flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 mb-1">
                    Seller Preparing Shipment
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    {demoOrderDetails.sellerName} has been notified and will prepare your order for shipment.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 mb-1">
                    Delivery Tracking Available Soon
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    Once shipped, you'll receive tracking details to monitor your delivery in real-time.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Eye className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 mb-1">
                    Confirm Delivery to Release Payment
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    After receiving your goods, confirm the delivery to release the payment to the seller.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow Protection Badge */}
          <div className="bg-gradient-to-br from-[#64b900]/5 to-[#64b900]/10 rounded-xl border border-[#64b900]/20 p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#64b900] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900">
                Protected by Escrow
              </h3>
            </div>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700">
              Your funds are safely held in escrow. Payment will only be released to the seller after you confirm 
              that the goods have been delivered in satisfactory condition.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setViewState('payment')}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-base font-semibold shadow-lg"
            >
              View Order Status
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-base font-medium">
              Go to Dashboard
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@kisansetu.com" className="text-[#64b900] hover:underline font-medium">
                support@kisansetu.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment Screen
  return (
    <div className="min-h-screen bg-[#fefaf0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-['Fraunces',sans-serif] text-4xl font-bold text-gray-900 mb-3">
            Secure Escrow Payment
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-gray-600">
            Your payment will be securely held in escrow until the goods are delivered and confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details & Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-4">
                Order Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={demoOrderDetails.productImage} 
                      alt={demoOrderDetails.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-lg text-gray-900 mb-1">
                      {demoOrderDetails.productName} - {demoOrderDetails.variety}
                    </h3>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                      {demoOrderDetails.quantity} {demoOrderDetails.unit} × ₹{demoOrderDetails.pricePerUnit.toLocaleString()}/{demoOrderDetails.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-['Geologica:Regular',sans-serif] font-bold text-xl text-gray-900">
                      ₹{demoOrderDetails.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Seller:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                      {demoOrderDetails.sellerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Location:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                      {demoOrderDetails.sellerLocation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Expected Delivery:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                      {demoOrderDetails.expectedDelivery}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Explanation */}
            <div className="bg-gradient-to-br from-[#64b900]/5 to-[#64b900]/10 rounded-xl border border-[#64b900]/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#64b900] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900">
                  How Escrow Protects You
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700">
                    Payment is held securely by the platform
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700">
                    Seller is notified once escrow payment is confirmed
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#64b900] shrink-0 mt-0.5" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700">
                    Funds are released only after buyer confirms delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-4">
                Select Payment Method
              </h2>
              <div className="space-y-3">
                {/* UPI */}
                <button
                  onClick={() => setSelectedPayment('upi')}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedPayment === 'upi'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === 'upi' ? 'bg-[#64b900]' : 'bg-gray-100'
                    }`}>
                      <Smartphone className={`w-5 h-5 ${
                        selectedPayment === 'upi' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">UPI</p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
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
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedPayment === 'card'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === 'card' ? 'bg-[#64b900]' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        selectedPayment === 'card' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                        Credit or Debit Card
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
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
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedPayment === 'netbanking'
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPayment === 'netbanking' ? 'bg-[#64b900]' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        selectedPayment === 'netbanking' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                        Net Banking
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">
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
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-6">
                Payment Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Subtotal</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                    ₹{demoOrderDetails.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Platform Fee (2%)</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                    ₹{platformFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                      Total Amount Payable
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-bold text-2xl text-[#64b900]">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Action */}
              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-base font-semibold shadow-lg hover:shadow-xl mb-4"
              >
                <Shield className="w-5 h-5" />
                Pay Securely into Escrow
                <ChevronRight className="w-5 h-5" />
              </button>

              <p className="font-['Geologica:Regular',sans-serif] text-xs text-center text-gray-500">
                Your funds will be held securely until delivery confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#64b900]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#64b900]" />
                </div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl font-bold text-gray-900">
                  Confirm Payment
                </h2>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Escrow Notice */}
              <div className="bg-[#64b900]/5 border border-[#64b900]/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#64b900] shrink-0 mt-0.5" />
                <div>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-1">
                    Secure Escrow Payment
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-700">
                    Your payment will be held securely in escrow until delivery confirmation. 
                    The seller will be notified once your payment is received.
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                      <img 
                        src={demoOrderDetails.productImage} 
                        alt={demoOrderDetails.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                        {demoOrderDetails.productName} - {demoOrderDetails.variety}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                        {demoOrderDetails.quantity} {demoOrderDetails.unit}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Seller:</span>
                      <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                        {demoOrderDetails.sellerName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Location:</span>
                      <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                        {demoOrderDetails.sellerLocation}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">Expected Delivery:</span>
                      <span className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-900">
                        {demoOrderDetails.expectedDelivery}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-['Fraunces',sans-serif] text-lg font-semibold text-gray-900 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Payment Method:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                      {getPaymentMethodLabel(selectedPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-bold text-2xl text-[#64b900]">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold shadow-lg"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
