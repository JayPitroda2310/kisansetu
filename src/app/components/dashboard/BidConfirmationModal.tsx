import { useEffect } from 'react';

interface BidConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  cropName: string;
  bidAmountPerKg: number;
  quantity: number;
}

export function BidConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  cropName,
  bidAmountPerKg,
  quantity
}: BidConfirmationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const totalPayable = bidAmountPerKg * quantity;

  const handleCancel = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Cancel clicked - returning to auction');
    // Only close this confirmation modal, not the main auction modal
    onClose();
  };

  const handleConfirm = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Confirm clicked - placing bid');
    // Close this confirmation modal first
    onClose();
    // Then execute the bid confirmation
    onConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      handleCancel(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
            Confirm Your Bid
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Crop Info */}
          <div>
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Crop
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-base text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {cropName}
            </p>
          </div>

          {/* Bid Amount Per Kg */}
          <div>
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Your Bid Amount (per kg)
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-3xl text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              ₹{bidAmountPerKg}
            </p>
          </div>

          {/* Total Payable */}
          <div className="bg-[#64b900]/5 border border-[#64b900]/20 rounded-lg p-4">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Total Payable if you win
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-3xl text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              ₹{totalPayable.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Warning Message */}
          <div className="pt-2">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              If you win the auction, you must complete escrow payment within 24 hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border-2 border-black/20 rounded-lg font-['Geologica:Regular',sans-serif] text-black hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", pointerEvents: 'auto' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-black transition-colors cursor-pointer"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", pointerEvents: 'auto' }}
            >
              Confirm Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}