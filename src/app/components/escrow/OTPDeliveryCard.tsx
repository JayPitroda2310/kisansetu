import { Lock, AlertTriangle } from 'lucide-react';

interface OTPDeliveryCardProps {
  otp: string;
  orderId: string;
}

export function OTPDeliveryCard({ otp, orderId }: OTPDeliveryCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 border-2 border-[#64b900] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-[#64b900] rounded-xl flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-['Fraunces',sans-serif] text-lg text-gray-900 font-semibold">
            🔒 Delivery OTP
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Order {orderId}
          </p>
        </div>
      </div>

      {/* OTP Display */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-2 uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Your OTP Code
        </p>
        <div className="font-['Geologica:Regular',sans-serif] text-4xl font-bold text-[#64b900] tracking-[0.3em]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          {otp}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl p-3 mb-3">
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Share this OTP <span className="font-semibold">ONLY after receiving your goods.</span>
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-['Geologica:Regular',sans-serif] text-xs font-semibold text-yellow-800 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Warning
          </p>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-yellow-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Do not share this OTP before delivery. This OTP confirms delivery and releases payment.
          </p>
        </div>
      </div>
    </div>
  );
}