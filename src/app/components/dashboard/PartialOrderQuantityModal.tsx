import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Package, Minus, Plus } from 'lucide-react';

interface PartialOrderQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  listing: {
    cropName: string;
    quantity: number;
    unit: string;
    moq: number;
    moqPrice: number;
    saleType: 'auction' | 'fixed';
  };
}

export function PartialOrderQuantityModal({
  isOpen,
  onClose,
  onConfirm,
  listing
}: PartialOrderQuantityModalProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(listing.moq);

  if (!isOpen || !listing) {
    return null;
  }

  const handleQuantityChange = (value: number) => {
    // Ensure quantity is between MOQ and total quantity
    if (value >= listing.moq && value <= listing.quantity) {
      setSelectedQuantity(value);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedQuantity);
  };

  const totalPrice = selectedQuantity * listing.moqPrice;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-2.5 border-b border-gray-200">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Select Partial Order Quantity
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-0.5">
            Choose how much {listing.cropName} you want to purchase (Minimum: {listing.moq} {listing.unit})
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="p-4">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#64b900]/10 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-[#64b900]" />
              </div>
              <div>
                <h3 className="font-['Fraunces:Bold',serif] font-bold text-gray-900">
                  {listing.cropName}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Partial Order at Fixed Price
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-gray-600 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Available Quantity
                </p>
                <p className="font-['Geologica:SemiBold',sans-serif] text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {listing.quantity} {listing.unit}
                </p>
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-gray-600 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Price per {listing.unit}
                </p>
                <p className="font-['Geologica:SemiBold',sans-serif] text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  ₹{listing.moqPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-3">
            <label className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-700 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Select Quantity ({listing.unit})
            </label>

            <div className="flex items-center gap-4">
              {/* Decrement Button */}
              <button
                onClick={() => handleQuantityChange(selectedQuantity - 10)}
                disabled={selectedQuantity <= listing.moq}
                className="w-11 h-11 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-[#64b900] hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>

              {/* Quantity Input */}
              <div className="flex-1">
                <input
                  type="number"
                  value={selectedQuantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  min={listing.moq}
                  max={listing.quantity}
                  step={10}
                  className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-[#64b900] focus:ring-2 focus:ring-[#64b900]/20 focus:outline-none"
                />
                <div className="flex justify-between items-center mt-1.5 px-2">
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Min: {listing.moq}
                  </span>
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Max: {listing.quantity}
                  </span>
                </div>
              </div>

              {/* Increment Button */}
              <button
                onClick={() => handleQuantityChange(selectedQuantity + 10)}
                disabled={selectedQuantity >= listing.quantity}
                className="w-11 h-11 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-[#64b900] hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Range Slider */}
            <div className="mt-2.5">
              <input
                type="range"
                value={selectedQuantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                min={listing.moq}
                max={listing.quantity}
                step={10}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#64b900]"
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[#64b900]/5 border-2 border-[#64b900]/20 rounded-lg p-3 mb-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-['Geologica:Regular',sans-serif] text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Selected Quantity:
                </span>
                <span className="font-['Geologica:SemiBold',sans-serif] text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedQuantity} {listing.unit}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-['Geologica:Regular',sans-serif] text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Price per {listing.unit}:
                </span>
                <span className="font-['Geologica:SemiBold',sans-serif] text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  ₹{listing.moqPrice.toLocaleString()}
                </span>
              </div>

              <div className="pt-1.5 border-t-2 border-[#64b900]/30">
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:SemiBold',sans-serif] text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {listing.saleType === 'auction' ? 'Base Total Price:' : 'Total Price:'}
                  </span>
                  <span className="font-['Fraunces:Bold',serif] text-xl font-bold text-[#64b900]">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          {listing.saleType === 'auction' && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-amber-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                ℹ️ <strong>Note:</strong> Partial orders are at fixed price (₹{listing.moqPrice}/unit).
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-2.5 bg-[#64b900] text-white font-semibold rounded-lg hover:bg-[#559900] transition-colors"
            >
              {listing.saleType === 'auction' ? 'Proceed to Bid' : 'Proceed to Buy'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}