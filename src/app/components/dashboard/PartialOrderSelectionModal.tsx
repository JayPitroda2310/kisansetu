import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Package, ShoppingCart } from 'lucide-react';

interface PartialOrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWholeLot: () => void;
  onSelectPartialOrder: () => void;
  listing: {
    cropName: string;
    quantity: number;
    unit: string;
    moq?: number;
    moqPrice?: number;
    pricePerUnit: number;
    saleType: 'auction' | 'fixed';
  };
}

export function PartialOrderSelectionModal({
  isOpen,
  onClose,
  onSelectWholeLot,
  onSelectPartialOrder,
  listing
}: PartialOrderSelectionModalProps) {
  
  // Safety check - don't render if listing is undefined or modal is not open
  if (!isOpen || !listing) {
    return null;
  }
  
  const handleWholeLot = () => {
    onSelectWholeLot();
    onClose();
  };

  const handlePartialOrder = () => {
    onSelectPartialOrder();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-3 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Select Order Type
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            This seller accepts both whole lot and partial orders. Choose your preference:
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Whole Lot Option */}
            <button
              onClick={handleWholeLot}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#64b900] hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#64b900]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#64b900]/20 transition-colors">
                  <ShoppingCart className="w-8 h-8 text-[#64b900]" />
                </div>
                
                <h3 className="font-['Fraunces:Bold',serif] text-lg font-bold text-gray-900 mb-2">
                  Whole Lot
                </h3>
                
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Purchase the entire quantity
                </p>

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-['Geologica:Regular',sans-serif] text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Quantity:
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.quantity} {listing.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-['Geologica:Regular',sans-serif] text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Price per {listing.unit}:
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{listing.pricePerUnit}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.saleType === 'auction' ? 'Base Total:' : 'Total Price:'}
                      </span>
                      <span className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        ₹{(listing.quantity * listing.pricePerUnit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {listing.saleType === 'auction' && (
                  <div className="mt-4 w-full">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-amber-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Proceed to auction bidding
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-[#64b900] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </button>

            {/* Partial Order Option */}
            <button
              onClick={handlePartialOrder}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#64b900] hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#64b900]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#64b900]/20 transition-colors">
                  <Package className="w-8 h-8 text-[#64b900]" />
                </div>
                
                <h3 className="font-['Fraunces:Bold',serif] text-lg font-bold text-gray-900 mb-2">
                  Partial Order
                </h3>
                
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Order a smaller quantity
                </p>

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-['Geologica:Regular',sans-serif] text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Min. Order (MOQ):
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.moq || 0} {listing.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-['Geologica:Regular',sans-serif] text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Price per {listing.unit}:
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{listing.moqPrice || listing.pricePerUnit}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Min. Total:
                      </span>
                      <span className="font-['Geologica:Regular',sans-serif] text-lg font-bold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        ₹{((listing.moq || 0) * (listing.moqPrice || listing.pricePerUnit)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      <strong>Note:</strong> Partial orders are always Fixed Price
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-[#64b900] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 text-center" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              💡 <strong>Tip:</strong> {listing.saleType === 'auction' 
                ? 'Whole lot purchases go through auction, while partial orders are always at fixed price.' 
                : 'Choose based on your requirement and budget.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}