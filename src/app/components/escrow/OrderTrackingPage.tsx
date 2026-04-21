import { useState } from 'react';
import { CheckCircle, Clock, Package, Truck, Lock, Flag, AlertCircle } from 'lucide-react';
import { OTPDeliveryCard } from './OTPDeliveryCard';

interface OrderTrackingPageProps {
  orderId: string;
  otp: string;
  productName: string;
  productVariety: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  sellerName: string;
  status: 'payment-escrow' | 'preparing' | 'in-transit' | 'awaiting-otp' | 'completed';
  onConfirmDelivery?: () => void;
  onRaiseIssue?: () => void;
  onViewOrder?: () => void;
}

export function OrderTrackingPage({
  orderId,
  otp,
  productName,
  productVariety,
  quantity,
  unit,
  totalAmount,
  sellerName,
  status,
  onConfirmDelivery,
  onRaiseIssue,
  onViewOrder
}: OrderTrackingPageProps) {
  const [showIssueModal, setShowIssueModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const timelineSteps = [
    {
      id: 'payment-escrow',
      label: 'Payment in Escrow',
      icon: Lock,
      completed: ['payment-escrow', 'preparing', 'in-transit', 'awaiting-otp', 'completed'].includes(status)
    },
    {
      id: 'preparing',
      label: 'Seller Preparing Delivery',
      icon: Package,
      completed: ['preparing', 'in-transit', 'awaiting-otp', 'completed'].includes(status)
    },
    {
      id: 'in-transit',
      label: 'Awaiting Delivery',
      icon: Truck,
      completed: ['in-transit', 'awaiting-otp', 'completed'].includes(status)
    },
    {
      id: 'awaiting-otp',
      label: 'Awaiting OTP Confirmation',
      icon: Lock,
      completed: ['awaiting-otp', 'completed'].includes(status)
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      completed: status === 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 font-semibold mb-2">
            My Order
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Track your order and manage delivery
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4">
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Order ID
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    {orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Product
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    {productName} - {productVariety}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Quantity
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    {quantity} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Seller
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    {sellerName}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-[#64b900]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-6">
                Transaction Timeline
              </h2>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === status;
                  const isCompleted = step.completed;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Icon & Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-[#64b900] text-white'
                            : isActive
                            ? 'bg-[#64b900]/20 text-[#64b900] border-2 border-[#64b900]'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isActive ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            isCompleted ? 'bg-[#64b900]' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 pt-2">
                        <p className={`font-['Geologica:Regular',sans-serif] text-sm font-medium ${
                          isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                        }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {isCompleted ? '✔' : isActive ? '⏳' : '⏳'} {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {onConfirmDelivery && (
                <button
                  onClick={onConfirmDelivery}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Delivery
                </button>
              )}
              
              <button
                onClick={() => setShowIssueModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                <Flag className="w-4 h-4" />
                Raise Issue
              </button>
            </div>
          </div>

          {/* Right Column - OTP Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OTPDeliveryCard
                otp={otp}
                orderId={orderId}
                onViewOrder={onViewOrder}
              />

              {/* OTP Reminder */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs font-semibold text-blue-800 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Important Reminder
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Provide this OTP to the seller only after receiving your goods in good condition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Modal (placeholder) */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-md w-full p-6">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4">
              Raise an Issue
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-6" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              This feature will help you report any issues with your order.
            </p>
            <button
              onClick={() => setShowIssueModal(false)}
              className="w-full py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
