import { useState } from 'react';
import { OrderTrackingPage } from './OrderTrackingPage';
import { OTPEntryModal } from './OTPEntryModal';

export function OTPDemo() {
  const [showSellerOTPModal, setShowSellerOTPModal] = useState(false);
  const [showBuyerTracking, setShowBuyerTracking] = useState(false);

  // Sample OTP for demo
  const demoOTP = '482193';
  const demoOrderId = '#ORD-2024-001234';

  const handleVerifyOTP = async (otp: string): Promise<{ success: boolean; message?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === demoOTP) {
      return { success: true };
    } else {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-['Fraunces',sans-serif] text-4xl text-gray-900 font-semibold mb-4">
            OTP Delivery System Demo
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Secure escrow payment release with OTP verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Buyer View Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🌾</span>
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
                Buyer View
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Track order and manage OTP delivery
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <strong>Features:</strong>
                </p>
                <ul className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 space-y-1 list-disc list-inside" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <li>View delivery OTP</li>
                  <li>Copy OTP to clipboard</li>
                  <li>Transaction timeline</li>
                  <li>Order tracking</li>
                  <li>Raise issue option</li>
                </ul>
              </div>

              <button
                onClick={() => setShowBuyerTracking(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                View Buyer Order Tracking
              </button>
            </div>
          </div>

          {/* Seller View Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
                Seller View
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Enter OTP to release payment
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <strong>Features:</strong>
                </p>
                <ul className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 space-y-1 list-disc list-inside" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <li>Enter 6-digit OTP</li>
                  <li>Auto-focus navigation</li>
                  <li>Paste support</li>
                  <li>3 attempt limit</li>
                  <li>Success/error states</li>
                </ul>
              </div>

              <button
                onClick={() => setShowSellerOTPModal(true)}
                className="w-full py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                View Seller OTP Entry
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-yellow-800" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <strong>Demo OTP:</strong> {demoOTP}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-6 text-center">
            How OTP Escrow Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-2">
                Payment in Escrow
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Buyer pays, funds held securely
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-2">
                OTP Generated
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                6-digit OTP sent to buyer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-2">
                Delivery & OTP
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Buyer shares OTP after receiving goods
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#64b900]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-[#64b900]">4</span>
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900 mb-2">
                Payment Released
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Seller enters OTP, receives payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Tracking Modal */}
      {showBuyerTracking && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <button
            onClick={() => setShowBuyerTracking(false)}
            className="fixed top-4 right-4 z-10 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
          >
            Close Demo
          </button>
          <OrderTrackingPage
            orderId={demoOrderId}
            otp={demoOTP}
            productName="Wheat"
            productVariety="HD-2967"
            quantity={100}
            unit="Quintal"
            totalAmount={230000}
            sellerName="Rajesh Patel"
            status="awaiting-otp"
          />
        </div>
      )}

      {/* Seller OTP Entry Modal */}
      <OTPEntryModal
        isOpen={showSellerOTPModal}
        onClose={() => setShowSellerOTPModal(false)}
        onVerify={handleVerifyOTP}
        buyerName="Rajesh Patel"
        orderAmount={230000}
        orderId={demoOrderId}
      />
    </div>
  );
}
