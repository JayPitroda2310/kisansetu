import { X, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ExtendAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hours: number) => void;
  listing: {
    cropName: string;
    variety: string;
    auctionEndDate?: string;
  };
}

export function ExtendAuctionModal({ isOpen, onClose, onConfirm, listing }: ExtendAuctionModalProps) {
  const [selectedHours, setSelectedHours] = useState<number>(6);

  if (!isOpen) return null;

  const extensionOptions = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' },
    { value: 6, label: '6 Hours' },
    { value: 12, label: '12 Hours' },
    { value: 24, label: '24 Hours' },
    { value: 48, label: '48 Hours' },
    { value: 72, label: '3 Days' }
  ];

  const handleConfirm = () => {
    onConfirm(selectedHours);
    onClose();
  };

  const getNewEndDate = () => {
    if (!listing.auctionEndDate) return null;
    const currentEnd = new Date(listing.auctionEndDate);
    const newEnd = new Date(currentEnd.getTime() + selectedHours * 60 * 60 * 1000);
    return newEnd.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-black/10">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-black/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Extend Auction Time
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {listing.cropName} - {listing.variety}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Extending the auction time will give buyers more opportunity to place bids. All existing bids will remain valid.
              </p>
            </div>
          </div>

          {/* Current End Date */}
          {listing.auctionEndDate && (
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-2 uppercase tracking-wider" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Current End Date
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-base text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {new Date(listing.auctionEndDate).toLocaleString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          )}

          {/* Extension Options */}
          <div>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Select Extension Duration
            </p>
            <div className="grid grid-cols-3 gap-3">
              {extensionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedHours(option.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium ${
                    selectedHours === option.value
                      ? 'border-[#64b900] bg-[#64b900]/10 text-[#64b900]'
                      : 'border-black/10 text-black hover:border-[#64b900]/50 hover:bg-black/5'
                  }`}
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* New End Date Preview */}
          <div className="p-4 bg-[#64b900]/10 border-2 border-[#64b900]/30 rounded-xl">
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900] mb-2 uppercase tracking-wider font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              New End Date
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-lg text-black font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {getNewEndDate()}
            </p>
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/70 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Auction will be extended by {selectedHours} hour{selectedHours !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-black/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-black/10 text-black rounded-lg hover:bg-black/5 transition-colors font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#558a00] transition-colors font-['Geologica:Regular',sans-serif] shadow-md"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Extend Auction
          </button>
        </div>
      </div>
    </div>
  );
}
