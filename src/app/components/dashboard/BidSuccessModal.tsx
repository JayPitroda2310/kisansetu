import { useEffect } from 'react';

interface BidSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueBidding?: () => void;
  cropName: string;
  bidAmountPerKg: number;
}

export function BidSuccessModal({
  isOpen,
  onClose,
  onContinueBidding,
  cropName,
  bidAmountPerKg
}: BidSuccessModalProps) {
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleContinueBidding = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Continue Bidding clicked - returning to auction');
    if (onContinueBidding) {
      onContinueBidding();
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Prevent closing by clicking overlay
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4"
      onClick={handleOverlayClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Success Icon */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-20 h-20 bg-[#64b900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#64b900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-2">
            Bid Placed Successfully
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Your bid has been placed on {cropName}
          </p>
        </div>

        {/* Bid Details */}
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[#64b900]/5 border border-[#64b900]/20 rounded-lg p-4 text-center">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Your Bid Amount (per kg)
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-3xl text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              ₹{bidAmountPerKg.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              What happens next?
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#64b900] mt-0.5">✓</span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  You'll be notified if you're outbid
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#64b900] mt-0.5">✓</span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  If you win, complete escrow payment within 24 hours
                </span>
              </li>
            </ul>
          </div>

          {/* Continue Bidding Button */}
          <button
            type="button"
            onClick={handleContinueBidding}
            className="w-full px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-black transition-colors cursor-pointer"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", pointerEvents: 'auto' }}
          >
            Continue Bidding
          </button>
        </div>
      </div>
    </div>
  );
}