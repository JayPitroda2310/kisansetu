import { useState, useEffect } from 'react';
import { X, Clock, TrendingUp, MapPin, Package, Calendar, Star, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PartialOrderSelectionModal } from './PartialOrderSelectionModal';

interface BuyerViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  listing: {
    id: string;
    cropName: string;
    variety: string;
    grade: string;
    harvestDate: string;
    quantity: number;
    quantityRemaining: number;
    unit: string;
    orderType: 'whole' | 'partial';
    saleType: 'auction' | 'fixed';
    pricePerUnit: number;
    totalPrice: number;
    minimumBidIncrement?: number;
    auctionEndDate?: string;
    location: { district: string; state: string; pincode: string };
    packagingType: string;
    storageType: string;
    pickupMethod: string;
    description: string;
    images: string[];
    moq?: number;
    moqPrice?: number;
    status: 'active' | 'sold' | 'expired' | 'paused';
    postedDate: string;
    listingId: string;
    seller_id?: string;
    bids?: Array<{
      id: string;
      bidderName: string;
      bidAmount: number;
      timestamp: string;
      status: 'leading' | 'outbid' | 'active';
    }>;
    auctionStartDate?: string;
  };
}

interface BidActivity {
  bidder: string;
  amount: number;
  timeAgo: string;
  status: 'leading' | 'outbid';
}

export function BuyerViewDetailsModal({ isOpen, onClose, onNavigate, listing }: BuyerViewDetailsModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPartialOrderModal, setShowPartialOrderModal] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'whole' | 'partial' | null>(null);

  // Calculate time remaining for auctions
  useEffect(() => {
    if (!listing || listing.saleType !== 'auction' || !listing.auctionEndDate) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(listing.auctionEndDate!).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft(0);
        return;
      }

      setTimeLeft(Math.floor(distance / 1000));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [listing, isOpen]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getCurrentHighestBid = () => {
    if (!listing.bids || listing.bids.length === 0) {
      return listing.pricePerUnit;
    }
    return Math.max(...listing.bids.map(bid => bid.bidAmount));
  };

  const getBidActivity = (): BidActivity[] => {
    if (!listing.bids || listing.bids.length === 0) {
      return [];
    }
    
    return listing.bids.slice(0, 5).map(bid => ({
      bidder: bid.bidderName,
      amount: bid.bidAmount,
      timeAgo: bid.timestamp,
      status: bid.status === 'leading' ? 'leading' : 'outbid'
    }));
  };

  const currentHighestBid = getCurrentHighestBid();
  const minNextBid = currentHighestBid + (listing.minimumBidIncrement || 0);
  const bidActivity = getBidActivity();

  if (!isOpen || !listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {listing.saleType === 'auction' ? 'Live Auction' : 'Fixed Price Listing'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-0.5">
                {listing.orderType === 'whole' ? 'Whole Lot ' : 'Partial Orders '}{listing.saleType === 'auction' ? 'Auction' : 'Purchase'} Mode
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-semibold text-[#64b900]">
                  {listing.status === 'active' ? 'Active' : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
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
            {/* Left Column - Product & Auction Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex gap-5">
                  <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <ImageWithFallback
                        src={listing.images[0]}
                        alt={listing.cropName}
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
                        <h3 className="text-xl font-bold text-gray-900">{listing.cropName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Variety: <span className="text-[#64b900] font-medium">{listing.variety}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Grade: <span className="font-medium">{listing.grade}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-900">4.8</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Total Quantity</p>
                        <p className="font-semibold text-gray-900">{listing.quantity} {listing.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Location</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#64b900]" />
                          <p className="font-medium text-gray-900">{listing.location.district}, {listing.location.state}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Packaging</p>
                        <div className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-gray-600" />
                          <p className="font-medium text-gray-900">{listing.packagingType}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Storage</p>
                        <p className="font-medium text-gray-900">{listing.storageType}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 mb-1">Harvest Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-600" />
                          <p className="font-medium text-gray-900">{listing.harvestDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auction Information */}
              {listing.saleType === 'auction' ? (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Information</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Base Price (per {listing.unit})</p>
                      <p className="text-2xl font-bold text-gray-900">₹{listing.pricePerUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Minimum Bid Increment</p>
                      <p className="text-2xl font-bold text-[#64b900]">₹{listing.minimumBidIncrement || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Lot Value (Base)</p>
                      <p className="text-2xl font-bold text-gray-900">₹{listing.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Highest Bid (per {listing.unit})</p>
                        <p className="text-3xl font-bold text-[#64b900]">₹{currentHighestBid}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Total: <span className="font-semibold">₹{(currentHighestBid * listing.quantity).toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-[#64b900]" />
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Auction Ends In</p>
                    <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-3">
                      If a bid is placed in the last 2 minutes, the auction extends automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price per {listing.unit}</p>
                      <p className="text-3xl font-bold text-[#64b900]">₹{listing.pricePerUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Price</p>
                      <p className="text-3xl font-bold text-gray-900">₹{listing.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {listing.moq && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-amber-900 mb-1">Minimum Order Quantity</p>
                      <p className="text-lg font-bold text-amber-900">{listing.moq} {listing.unit}</p>
                      {listing.moqPrice && (
                        <p className="text-sm text-amber-800 mt-1">
                          at ₹{listing.moqPrice.toLocaleString()} per {listing.unit}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bid Activity */}
              {listing.saleType === 'auction' && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Bid Activity</h3>
                  
                  {bidActivity.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Bidder</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Bid Amount (per {listing.unit})</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Time Placed</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bidActivity.map((bid, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 text-sm font-medium text-gray-900">{bid.bidder}</td>
                                <td className="py-3 text-sm font-semibold text-gray-900">₹{bid.amount}</td>
                                <td className="py-3 text-sm text-gray-600">{bid.timeAgo}</td>
                                <td className="py-3">
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                      bid.status === 'leading'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                    }`}
                                  >
                                    {bid.status === 'leading' ? 'Leading' : 'Outbid'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button className="w-full mt-4 text-sm text-[#64b900] hover:underline font-medium">
                        View Full History
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No bids yet. Be the first to bid!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
              )}
            </div>

            {/* Right Column - Buyer Actions Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-[#64b900] rounded-lg p-5 sticky top-24">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium">
                    📋 Public Preview Mode
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    This is how buyers see your listing
                  </p>
                </div>

                {listing.saleType === 'auction' ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>

                    {/* Current Highest Bid */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
                      <p className="text-3xl font-bold text-gray-900">₹{currentHighestBid}</p>
                      <p className="text-sm text-gray-500 mt-1">per {listing.unit}</p>
                    </div>

                    {/* Minimum Next Bid */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Minimum Next Bid</p>
                      <p className="text-xl font-bold text-[#64b900]">₹{minNextBid} per {listing.unit}</p>
                    </div>

                    {/* Bid Amount Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Enter Bid Amount (per {listing.unit}) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          disabled
                          className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold bg-gray-50 cursor-not-allowed"
                          placeholder={`Min: ₹${minNextBid}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Your bid must be at least ₹{listing.minimumBidIncrement || 0} higher than the current highest bid.
                      </p>
                    </div>

                    {/* Escrow Protection */}
                    <div className="flex items-start gap-2 mb-6">
                      <input
                        type="checkbox"
                        disabled
                        className="mt-0.5 cursor-not-allowed"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Escrow Protection Enabled
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full bg-[#64b900] hover:bg-[#559900] text-white font-semibold py-4 px-4 rounded-lg text-base cursor-not-allowed opacity-75"
                      >
                        Place Bid (Demo)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Details</h3>

                    {/* Price Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Fixed Price</p>
                      <p className="text-3xl font-bold text-[#64b900]">₹{listing.pricePerUnit}</p>
                      <p className="text-sm text-gray-500 mt-1">per {listing.unit}</p>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="text-xl font-bold text-gray-900">₹{listing.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Quantity Info */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Available Quantity</p>
                      <p className="text-xl font-bold text-gray-900">{listing.quantityRemaining} {listing.unit}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full bg-[#64b900] hover:bg-[#559900] text-white font-semibold py-4 px-4 rounded-lg text-base cursor-not-allowed opacity-75"
                      >
                        Contact Seller (Demo)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}