import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { X, Package, MapPin, Calendar, Star, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PartialOrderSelectionModal } from './PartialOrderSelectionModal';
import { EscrowPaymentPage } from '../escrow/EscrowPaymentPage';

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderStatus?: () => void;
  product: {
    name: string;
    image: string;
    variety: string;
    grade: string;
    quantity: string;
    location: string;
    packaging: string;
    storage: string;
    harvestDate: string;
    rating: number;
  };
  auction: {
    basePrice: number;
    minIncrement: number;
    totalLotValue: number;
    currentHighestBid: number;
    endsIn: number; // seconds
  };
  orderType?: 'whole' | 'partial';
  moq?: number;
  moqPrice?: number;
  sellerId?: string; // Seller's UUID
  sellerName?: string; // Seller's name
  listingId?: string; // Listing ID to mark as sold after payment
}

export function BuyNowModal({ isOpen, onClose, onViewOrderStatus, product, auction, orderType = 'whole', moq, moqPrice, sellerId, sellerName, listingId }: BuyNowModalProps) {
  const [showPartialOrderModal, setShowPartialOrderModal] = useState(false);
  const [showBuyConfirmation, setShowBuyConfirmation] = useState(false);
  const [showEscrowPayment, setShowEscrowPayment] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'whole' | 'partial' | null>(null);
  const [quantity, setQuantity] = useState(moq || 10);
  const [escrowEnabled, setEscrowEnabled] = useState(true);

  // Parse quantity from string (e.g., "200 Quintal" -> 200)
  const parseQuantity = (qtyStr: string) => {
    const match = qtyStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const parseUnit = (qtyStr: string) => {
    const match = qtyStr.match(/\d+\s+(.+)/);
    return match ? match[1] : 'Quintal';
  };

  const totalQuantity = parseQuantity(product.quantity);
  const unit = parseUnit(product.quantity);

  const handleBuyNowClick = () => {
    // Check if partial orders are available
    if (orderType === 'partial') {
      setShowPartialOrderModal(true);
    } else {
      // Direct whole lot purchase
      setSelectedOrderType('whole');
      setQuantity(totalQuantity);
      setShowBuyConfirmation(true);
    }
  };

  const handleSelectWholeLot = () => {
    setSelectedOrderType('whole');
    setQuantity(totalQuantity);
    setShowBuyConfirmation(true);
  };

  const handleSelectPartialOrder = () => {
    setSelectedOrderType('partial');
    setQuantity(moq || 10);
    setShowBuyConfirmation(true);
  };

  const handleConfirmPurchase = () => {
    console.log('Purchase confirmed:', { selectedOrderType, quantity });
    // Handle purchase logic
    setShowBuyConfirmation(false);
    if (escrowEnabled) {
      setShowEscrowPayment(true);
    } else {
      onClose();
    }
  };

  const calculateTotal = () => {
    if (selectedOrderType === 'partial') {
      return quantity * (moqPrice || auction.basePrice);
    }
    return quantity * auction.basePrice;
  };

  const getMinQuantity = () => {
    if (selectedOrderType === 'partial') {
      return moq || 10;
    }
    return totalQuantity;
  };

  const getMaxQuantity = () => {
    if (selectedOrderType === 'partial') {
      return totalQuantity;
    }
    return totalQuantity;
  };

  const getPricePerUnit = () => {
    if (selectedOrderType === 'partial') {
      return moqPrice || auction.basePrice;
    }
    return auction.basePrice;
  };

  if (!isOpen || !product) return null;

  return (
    <>
      <Dialog 
        open={isOpen && !showPartialOrderModal && !showBuyConfirmation && !showEscrowPayment} 
        onOpenChange={(open) => !open && onClose()}
      >
        <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Fixed Price Purchase
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-0.5">
                  {orderType === 'whole' ? 'Whole Lot' : 'Whole Lot or Partial Orders'} Available
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-semibold text-[#64b900]">
                    Available
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Product Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Product Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex gap-5">
                    <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Variety: <span className="text-[#64b900] font-medium">{product.variety}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Grade: <span className="font-medium">{product.grade}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Total Quantity</p>
                          <p className="font-semibold text-gray-900">{product.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Location</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#64b900]" />
                            <p className="font-medium text-gray-900">{product.location}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Packaging</p>
                          <div className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-gray-600" />
                            <p className="font-medium text-gray-900">{product.packaging}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Storage</p>
                          <p className="font-medium text-gray-900">{product.storage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Harvest Date</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-600" />
                            <p className="font-medium text-gray-900">{product.harvestDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fixed Price per {unit}</p>
                      <p className="text-3xl font-bold text-[#64b900]">₹{auction.basePrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Price (Whole Lot)</p>
                      <p className="text-3xl font-bold text-gray-900">₹{auction.totalLotValue.toLocaleString()}</p>
                    </div>
                  </div>

                  {orderType === 'partial' && moq && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Partial Orders Available</p>
                      <div className="space-y-1">
                        <p className="text-sm text-amber-800">
                          Minimum Order Quantity: <span className="font-bold">{moq} {unit}</span>
                        </p>
                        {moqPrice && (
                          <p className="text-sm text-amber-800">
                            Price for partial orders: <span className="font-bold">₹{moqPrice}</span> per {unit}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Purchase Action */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-[#64b900] rounded-lg p-5 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Now</h3>

                  {/* Price Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Fixed Price</p>
                    <p className="text-3xl font-bold text-[#64b900]">₹{auction.basePrice}</p>
                    <p className="text-sm text-gray-500 mt-1">per {unit}</p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-gray-600">Total (Whole Lot)</p>
                      <p className="text-xl font-bold text-gray-900">₹{auction.totalLotValue.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Available Quantity */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Available Quantity</p>
                    <p className="text-xl font-bold text-gray-900">{product.quantity}</p>
                  </div>

                  {/* Order Type Info */}
                  {orderType === 'partial' && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        📦 Flexible Ordering
                      </p>
                      <p className="text-xs text-blue-700">
                        You can choose to buy the whole lot or order a partial quantity (min. {moq} {unit})
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleBuyNowClick}
                      className="w-full bg-[#64b900] hover:bg-[#559900] text-white font-semibold py-4 px-4 rounded-lg text-base flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </button>

                    <button
                      className="w-full border-2 border-[#64b900] text-[#64b900] hover:bg-green-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Contact Seller
                    </button>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-[#64b900]">✓</span>
                        <span>Escrow Protection Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#64b900]">✓</span>
                        <span>Secure Payment Gateway</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#64b900]">✓</span>
                        <span>Quality Assurance Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Partial Order Selection Modal */}
      {showPartialOrderModal && (
        <PartialOrderSelectionModal
          isOpen={showPartialOrderModal}
          onClose={() => setShowPartialOrderModal(false)}
          onSelectWholeLot={handleSelectWholeLot}
          onSelectPartialOrder={handleSelectPartialOrder}
          listing={{
            cropName: product.name,
            quantity: totalQuantity,
            unit: unit,
            moq: moq,
            moqPrice: moqPrice,
            pricePerUnit: auction.basePrice,
            saleType: 'fixed'
          }}
        />
      )}

      {/* Buy Confirmation Modal */}
      {showBuyConfirmation && (
        <Dialog open={showBuyConfirmation} onOpenChange={(open) => !open && setShowBuyConfirmation(false)}>
          <DialogContent className="max-w-[1400px] w-[90vw]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Confirm Purchase
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Please review your order details before confirming
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              {/* Order Type */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Order Type</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedOrderType === 'whole' ? 'Whole Lot Purchase' : 'Partial Order'}
                </p>
              </div>

              {/* Product Info */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Product</p>
                <p className="text-base font-semibold text-gray-900">{product.name} - {product.variety}</p>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity ({unit})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(getMinQuantity(), Math.min(getMaxQuantity(), Number(e.target.value))))}
                  min={getMinQuantity()}
                  max={getMaxQuantity()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#64b900]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: {getMinQuantity()} {unit} • Max: {getMaxQuantity()} {unit}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per {unit}:</span>
                  <span className="font-semibold text-gray-900">₹{getPricePerUnit()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">{quantity} {unit}</span>
                </div>
                <div className="pt-2 border-t border-green-300 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-[#64b900]">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow Protection */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5"
                  style={{ accentColor: '#64b900' }}
                  onChange={(e) => setEscrowEnabled(e.target.checked)}
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Enable Escrow Protection
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Funds will be held securely until delivery is confirmed
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={() => setShowBuyConfirmation(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-4 py-3 bg-[#64b900] hover:bg-[#559900] text-white rounded-lg font-semibold transition-colors"
              >
                Confirm Purchase
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Escrow Payment Page */}
      {showEscrowPayment && (
        <Dialog open={showEscrowPayment} onOpenChange={(open) => !open && setShowEscrowPayment(false)}>
          <DialogContent className="w-[96vw] max-w-[2000px] max-h-[95vh] p-0 overflow-y-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>Secure Escrow Payment</DialogTitle>
              <DialogDescription>Complete your secure payment through escrow protection</DialogDescription>
            </DialogHeader>
            <EscrowPaymentPage
              orderDetails={{
                productName: product.name,
                variety: product.variety,
                quantity: quantity,
                unit: unit,
                pricePerUnit: getPricePerUnit(),
                totalPrice: calculateTotal(),
                sellerId: sellerId, // Pass actual seller UUID
                sellerName: sellerName || 'Demo Seller', // Pass actual seller name
                sellerLocation: product.location,
                expectedDelivery: '5-7 Business Days',
                productImage: product.image,
                listingId: listingId, // Pass listing ID to mark as sold
              }}
              onCancel={() => {
                setShowEscrowPayment(false);
                onClose();
              }}
              onViewOrderStatus={() => {
                setShowEscrowPayment(false);
                onClose();
                if (onViewOrderStatus) {
                  onViewOrderStatus();
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}