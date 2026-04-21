import { useEffect } from 'react';

interface DemoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: () => void;
  onLose: () => void;
}

export function DemoStatusModal({
  isOpen,
  onClose,
  onWin,
  onLose
}: DemoStatusModalProps) {
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Win option clicked - closing demo modal');
    onWin();
    onClose();
  };

  const handleLose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Lose option clicked - closing demo modal');
    onLose();
    onClose();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    console.log('Cancel clicked - closing demo modal');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Prevent closing by clicking overlay
    e.preventDefault();
    e.stopPropagation();
  };

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
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-black/10">
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
            Demo: Change Auction Status
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Select the auction outcome to preview
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-3">
          {/* Win Option */}
          <button
            type="button"
            onClick={handleWin}
            className="w-full bg-[#64b900]/10 hover:bg-[#64b900]/20 border-2 border-[#64b900] rounded-lg p-5 text-left transition-colors group cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#64b900] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] text-lg text-black mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  You Won the Auction
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  See the winning screen with payment options
                </p>
              </div>
            </div>
          </button>

          {/* Lose Option */}
          <button
            type="button"
            onClick={handleLose}
            className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 rounded-lg p-5 text-left transition-colors group cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">😔</span>
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] text-lg text-black mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  You Lost the Auction
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  See the outbid screen
                </p>
              </div>
            </div>
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancel}
            className="w-full px-6 py-3 border-2 border-black/20 rounded-lg font-['Geologica:Regular',sans-serif] text-black hover:bg-gray-50 transition-colors mt-4 cursor-pointer"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", pointerEvents: 'auto' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}