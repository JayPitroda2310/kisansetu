import { useState, useRef, useEffect } from 'react';
import { X, Lock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface OTPEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  buyerName: string;
  orderAmount: number;
  orderId: string;
}

export function OTPEntryModal({ isOpen, onClose, onVerify, buyerName, orderAmount, orderId }: OTPEntryModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isLocked) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    if (isLocked) {
      setError('Too many attempts. Please contact support.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await onVerify(otpString);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset states
          setOtp(['', '', '', '', '', '']);
          setShowSuccess(false);
          setAttempts(0);
          setError('');
        }, 2000);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setError('Too many failed attempts. OTP entry locked. Please contact support.');
        } else {
          setError(result.message || `Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-lg w-full">
        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-[#64b900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#64b900]" />
            </div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
              ✅ OTP Verified Successfully
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Payment has been released from escrow.
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-lg text-[#64b900] font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {formatCurrency(orderAmount)} credited to your wallet
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#64b900] rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold">
                    Enter Delivery OTP
                  </h2>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Order {orderId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Buyer
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                    {buyerName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Amount in Escrow
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-[#64b900]">
                    {formatCurrency(orderAmount)}
                  </span>
                </div>
              </div>

              {/* Helper Text */}
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-4 text-center" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Enter the OTP provided by the buyer after delivery
              </p>

              {/* OTP Input */}
              <div className="mb-6">
                <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLocked || isVerifying}
                      className={`w-14 h-16 text-center font-['Geologica:Regular',sans-serif] text-2xl font-bold rounded-lg border-2 transition-all ${
                        error
                          ? 'border-red-500 bg-red-50'
                          : isLocked
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'border-gray-300 focus:border-[#64b900] focus:ring-2 focus:ring-[#64b900]/20'
                      }`}
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg ${
                    isLocked ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {isLocked ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`font-['Geologica:Regular',sans-serif] text-sm ${
                      isLocked ? 'text-red-700' : 'text-yellow-700'
                    }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Attempts Indicator */}
              {attempts > 0 && !isLocked && (
                <div className="text-center mb-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Attempts: {attempts} / {MAX_ATTEMPTS}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || isLocked || otp.join('').length !== 6}
                  className="flex-1 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Release Payment'}
                </button>
              </div>

              {/* Support Link */}
              {isLocked && (
                <div className="text-center mt-4">
                  <button className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] hover:underline" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Contact Support
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
