import { useState, useEffect } from 'react';
import { X, Package, MapPin, Clock, Eye, MessageSquare, Users, Gavel, AlertCircle, Trash2, Check } from 'lucide-react';
import { BuyerViewDetailsModal } from './BuyerViewDetailsModal';
import { AcceptBidConfirmationModal } from './AcceptBidConfirmationModal';
import { ExtendAuctionModal } from './ExtendAuctionModal';

interface SellerViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  onAcceptBid?: (bidId: string) => Promise<void>;
  onExtendAuction?: (hours: number) => Promise<void>;
  onDeleteListing?: () => Promise<void>;
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
    certificate?: string;
    moq?: number;
    moqPrice?: number;
    status: 'active' | 'sold' | 'expired' | 'paused';
    postedDate: string;
    listingId: string;
    stats: {
      views: number;
      bids: number;
      messages: number;
      interested: number;
    };
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

export function SellerViewDetailsModal({ isOpen, onClose, onNavigate, onAcceptBid, onExtendAuction, onDeleteListing, listing }: SellerViewDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [showAcceptBidModal, setShowAcceptBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<{ id: string; bidderName: string; bidAmount: number; timestamp: string; status: 'leading' | 'outbid' | 'active' } | null>(null);
  const [acceptedBids, setAcceptedBids] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAcceptedText, setShowAcceptedText] = useState<{ [key: string]: boolean }>({});
  const [showExtendAuctionModal, setShowExtendAuctionModal] = useState(false);
  const [extendedAuctionEndDate, setExtendedAuctionEndDate] = useState<string | undefined>(listing?.auctionEndDate);

  const handleConfirmAcceptBid = () => {
    if (selectedBid && onAcceptBid) {
      setAcceptedBids(prev => [...prev, selectedBid.id]);
      setShowAcceptedText(prev => ({ ...prev, [selectedBid.id]: true }));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      onAcceptBid(selectedBid.id);
    }
    setShowAcceptBidModal(false);
    setSelectedBid(null);
  };

  const handleExtendAuction = (hours: number) => {
    if (extendedAuctionEndDate && onExtendAuction) {
      const currentEnd = new Date(extendedAuctionEndDate);
      const newEnd = new Date(currentEnd.getTime() + hours * 60 * 60 * 1000);
      setExtendedAuctionEndDate(newEnd.toISOString());
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      onExtendAuction(hours);
    }
  };

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
        setTimeRemaining('Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = () => {
    if (!listing) return null;
    
    const statusConfig = {
      active: { text: 'Active', bg: '#64b90020', color: '#64b900', border: '#64b90040' },
      sold: { text: 'Sold', bg: '#10b98120', color: '#10b981', border: '#10b98140' },
      expired: { text: 'Expired', bg: '#6b728020', color: '#6b7280', border: '#6b728040' },
      paused: { text: 'Paused', bg: '#f59e0b20', color: '#f59e0b', border: '#f59e0b40' }
    };

    const config = statusConfig[listing.status] || statusConfig.active; // Default to active if status is unknown
    return (
      <span 
        className="px-4 py-1.5 text-sm rounded-lg font-['Geologica:Regular',sans-serif] border"
        style={{ 
          fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
          backgroundColor: config.bg,
          color: config.color,
          borderColor: config.border
        }}
      >
        {config.text}
      </span>
    );
  };

  if (!isOpen) return null;
  if (!listing) return null;

  const highestBid = listing.bids && listing.bids.length > 0 
    ? listing.bids.find(b => b.status === 'leading') 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[1200px] max-h-[90vh] bg-white flex flex-col rounded-2xl shadow-2xl border-2 border-black/10">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-black/10 flex items-start justify-between">
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
              {listing.cropName} - {listing.variety}
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm mt-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Posted on {new Date(listing.postedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Listing #{listing.listingId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Alert Banners */}
        {listing.saleType === 'auction' && timeRemaining && timeRemaining !== 'Ended' && (
          <div className="px-6 py-4 bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 border-b-2 border-[#f59e0b]/30 flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-[#f59e0b]" />
            <div className="text-center">
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-[#f59e0b]/80 uppercase tracking-wider mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Auction Ends In
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-3xl text-[#f59e0b] font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {timeRemaining}
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* LEFT COLUMN */}
            <div className="col-span-2 space-y-6">
              {/* Image Gallery */}
              <div>
                {/* Main Image */}
                <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#64b900]/20 to-[#64b900]/10 rounded-2xl border-2 border-black/10 flex items-center justify-center mb-3 overflow-hidden">
                  {listing.images.length > 0 ? (
                    <img 
                      src={listing.images[currentImageIndex]} 
                      alt={`${listing.cropName} ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-[#64b900]/40" />
                  )}

                  {/* Vertical Glass Effect Performance Stats Overlay */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-around py-6 bg-white/20 backdrop-blur-md border-r border-white/30 shadow-xl z-10">
                    <div className="text-center">
                      <Eye className="w-6 h-6 mx-auto mb-1 text-[#64b900]" />
                      <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.stats.views}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[10px] text-black/60 uppercase font-bold tracking-wider" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Views
                      </p>
                    </div>

                    <div className="text-center">
                      <Gavel className="w-6 h-6 mx-auto mb-1 text-[#64b900]" />
                      <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.stats.bids}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[10px] text-black/60 uppercase font-bold tracking-wider" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.saleType === 'auction' ? 'Bids' : 'Int.'}
                      </p>
                    </div>

                    <div className="text-center">
                      <MessageSquare className="w-6 h-6 mx-auto mb-1 text-[#64b900]" />
                      <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.stats.messages}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[10px] text-black/60 uppercase font-bold tracking-wider" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Msg
                      </p>
                    </div>

                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-1 text-[#64b900]" />
                      <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-bold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.stats.interested}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[10px] text-black/60 uppercase font-bold tracking-wider" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Inq.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3">
                  {listing.images.length > 0 ? (
                    listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          currentImageIndex === idx 
                            ? 'border-[#64b900] ring-2 ring-[#64b900]/30' 
                            : 'border-black/10 hover:border-[#64b900]/50'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))
                  ) : (
                    [...Array(5)].map((_, idx) => (
                      <div 
                        key={idx}
                        className="w-20 h-20 rounded-lg border-2 border-black/10 bg-white flex items-center justify-center"
                      >
                        <Package className="w-6 h-6 text-black/20" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Listing Actions Card */}
              <div className="bg-white rounded-2xl border-2 border-black/10 p-5 shadow-lg">
                <h3 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-black mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Manage Listing
                </h3>

                <div className="space-y-2">
                  {listing.saleType === 'auction' && listing.status === 'active' && (
                    <button 
                      onClick={() => setShowExtendAuctionModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-black/10 text-black rounded-lg hover:bg-black/5 transition-colors text-sm font-['Geologica:Regular',sans-serif]" 
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      <Clock className="w-4 h-4" />
                      Extend Auction Time
                    </button>
                  )}

                  <button 
                    onClick={() => onDeleteListing && onDeleteListing()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-500/50 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-['Geologica:Regular',sans-serif]" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Listing
                  </button>
                </div>
              </div>
            </div>

            {/* FULL WIDTH SECTIONS */}
            <div className="col-span-3 space-y-6">
              {/* Product Information Card */}
              <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
                <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-4">
                  Product Details
                </h3>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Crop Name
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.cropName}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Variety
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.variety || '---'}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Grade
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.grade}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Harvest Date
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {new Date(listing.harvestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Total Quantity
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Quantity Remaining
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.quantityRemaining} {listing.unit}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Packaging
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.packagingType}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Storage
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {listing.storageType}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-black/10 my-4" />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Location
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.location.district}, {listing.location.state}, {listing.location.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-[#64b900] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Pickup Method
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.pickupMethod === 'buyer' ? 'Buyer Pickup' : listing.pickupMethod === 'seller' ? 'Seller Delivery' : 'Transport Negotiable'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Sale Details Card */}
              <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
                <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-4">
                  Pricing & Sale Details
                </h3>

                <div className="flex gap-3 mb-4">
                  <span 
                    className="px-3 py-1.5 text-xs rounded-lg font-['Geologica:Regular',sans-serif] border"
                    style={{ 
                      fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                      backgroundColor: '#64b90020',
                      color: '#64b900',
                      borderColor: '#64b90040'
                    }}
                  >
                    {listing.saleType === 'auction' ? 'Auction' : 'Fixed Price'}
                  </span>
                  <span 
                    className="px-3 py-1.5 text-xs rounded-lg font-['Geologica:Regular',sans-serif] border"
                    style={{ 
                      fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                      backgroundColor: '#64b90020',
                      color: '#64b900',
                      borderColor: '#64b90040'
                    }}
                  >
                    {listing.orderType === 'whole' ? 'Whole Lot Only' : 'Partial Orders Allowed'}
                  </span>
                </div>

                <div className="h-px bg-black/10 mb-4" />

                {/* Auction Pricing */}
                {listing.saleType === 'auction' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Starting Bid Price
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formatCurrency(listing.totalPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Price per {listing.unit}
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formatCurrency(listing.pricePerUnit)}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Minimum Bid Increment
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formatCurrency(listing.minimumBidIncrement || 0)}
                        </p>
                      </div>

                      {highestBid && (
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Current Highest Bid
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-xl text-[#64b900] font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {formatCurrency(highestBid.bidAmount)}
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            +{formatCurrency(highestBid.bidAmount - listing.totalPrice)} from base
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Total Bids Received
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xl text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {listing.stats.bids} Bids
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-black/10" />

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Auction Duration
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {listing.auctionStartDate && listing.auctionEndDate ? (
                            <>
                              {Math.ceil((new Date(listing.auctionEndDate).getTime() - new Date(listing.auctionStartDate).getTime()) / (1000 * 60 * 60))} Hours
                            </>
                          ) : '---'}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Started On
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {listing.auctionStartDate ? new Date(listing.auctionStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Ends On
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {listing.auctionEndDate ? new Date(listing.auctionEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Time Remaining
                        </p>
                        <p className={`font-['Geologica:Regular',sans-serif] text-sm font-semibold ${timeRemaining === 'Ended' ? 'text-black/60' : 'text-[#64b900]'}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {timeRemaining || '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fixed Price Pricing */}
                {listing.saleType === 'fixed' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Fixed Price (Total)
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-2xl text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formatCurrency(listing.totalPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Price per {listing.unit}
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xl text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formatCurrency(listing.pricePerUnit)}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Listed On
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {new Date(listing.postedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Partial Orders Section */}
                {listing.orderType === 'partial' && listing.moq && (
                  <>
                    <div className="h-px bg-black/10 my-4" />
                    <div>
                      <h4 className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Partial Orders Details
                      </h4>
                      <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-3 italic" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Buyers can purchase minimum order quantity
                      </p>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            MOQ
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {listing.moq} {listing.unit}
                          </p>
                        </div>

                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Price per {listing.unit} (for MOQ)
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {listing.moqPrice ? formatCurrency(listing.moqPrice) : '---'}
                          </p>
                        </div>

                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Total for MOQ
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {listing.moq && listing.moqPrice ? formatCurrency(listing.moq * listing.moqPrice) : '---'}
                          </p>
                        </div>
                      </div>

                      {listing.quantity !== listing.quantityRemaining && (
                        <div className="mt-3 p-3 bg-[#64b900]/10 rounded-lg border border-[#64b900]/20">
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            <strong>{(((listing.quantity - listing.quantityRemaining) / listing.quantity) * 100).toFixed(0)}% sold</strong> • {listing.quantity - listing.quantityRemaining} {listing.unit} sold from partial orders
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
                <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-3">
                  Description
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80 leading-relaxed" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {listing.description || 'No description provided'}
                </p>
              </div>

              {/* Bid History Table (For Auctions) */}
              {listing.saleType === 'auction' && (
                <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                      Bid History - Top 5 Bids
                    </h3>
                    <span 
                      className="px-3 py-1.5 text-sm rounded-lg font-['Geologica:Regular',sans-serif]"
                      style={{ 
                        fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                        backgroundColor: '#64b90020',
                        color: '#64b900'
                      }}
                    >
                      {listing.stats.bids} Total Bids
                    </span>
                  </div>

                  {listing.bids && listing.bids.length > 0 ? (
                    <div className="overflow-hidden border-2 border-black/10 rounded-xl">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: '#64b900' }}>
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-white uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Bidder
                            </th>
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-white uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-white uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Time
                            </th>
                            <th className="px-4 py-3 text-center font-['Geologica:Regular',sans-serif] text-xs font-semibold text-white uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {listing.bids.slice(0, 5).map((bid, index) => (
                            <tr 
                              key={bid.id} 
                              className={`${index !== listing.bids.slice(0, 5).length - 1 ? 'border-b border-black/10' : ''} hover:bg-black/5 transition-colors h-[72px]`}
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center min-h-[40px]">
                                  <div>
                                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                      {bid.bidderName}
                                    </p>
                                    {bid.status === 'leading' && (
                                      <span 
                                        className="inline-block mt-1 px-2 py-0.5 text-xs rounded font-['Geologica:Regular',sans-serif]"
                                        style={{ 
                                          fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                                          backgroundColor: '#10b98120',
                                          color: '#10b981'
                                        }}
                                      >
                                        Leading
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center min-h-[40px]">
                                  <p className={`font-['Geologica:Regular',sans-serif] text-sm font-semibold ${bid.status === 'leading' ? 'text-[#64b900]' : 'text-black'}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                    {formatCurrency(bid.bidAmount)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center min-h-[40px]">
                                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                    {bid.timestamp}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2 min-h-[40px]">
                                  {acceptedBids.includes(bid.id) ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-2 text-[#64b900] text-sm font-['Geologica:Regular',sans-serif] font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                      <Check className="w-4 h-4" />
                                      Accepted
                                    </div>
                                  ) : (
                                    <button 
                                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#64b900] text-white rounded-lg hover:bg-[#558a00] transition-colors text-sm font-['Geologica:Regular',sans-serif] shadow-md" 
                                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                                      onClick={() => {
                                        setSelectedBid(bid);
                                        setShowAcceptBidModal(true);
                                      }}
                                    >
                                      <Check className="w-4 h-4" />
                                      Accept
                                    </button>
                                  )}
                                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900] hover:text-white transition-colors text-sm font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                                    onClick={() => {
                                      if (onNavigate) {
                                        onNavigate('messages');
                                        onClose();
                                      }
                                    }}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    Message
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-black/10 rounded-xl">
                      <Gavel className="w-16 h-16 mx-auto mb-3 text-black/20" />
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        No bids received yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Buyer Inquiries Card (For Fixed Price) */}
              {listing.saleType === 'fixed' && (
                <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                      Buyer Inquiries
                    </h3>
                    <span 
                      className="px-3 py-1.5 text-sm rounded-lg font-['Geologica:Regular',sans-serif]"
                      style={{ 
                        fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                        backgroundColor: '#64b90020',
                        color: '#64b900'
                      }}
                    >
                      {listing.stats.interested} Total Inquiries
                    </span>
                  </div>

                  {listing.stats.interested > 0 ? (
                    <div className="overflow-hidden border-2 border-black/10 rounded-xl">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-black/5">
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-black/70 uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Buyer
                            </th>
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-black/70 uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left font-['Geologica:Regular',sans-serif] text-xs font-semibold text-black/70 uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Time
                            </th>
                            <th className="px-4 py-3 text-center font-['Geologica:Regular',sans-serif] text-xs font-semibold text-black/70 uppercase tracking-wide" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {listing.stats.interested > 0 ? (
                            <tr 
                              className="hover:bg-black/5 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  Buyer Name
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  {listing.quantityRemaining} {listing.unit}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900] hover:text-white transition-colors text-xs font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Message
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr 
                              className="hover:bg-black/5 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  No Inquiries
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  ---
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  ---
                                </p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900] hover:text-white transition-colors text-xs font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Message
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-black/10 rounded-xl">
                      <Gavel className="w-16 h-16 mx-auto mb-3 text-black/20" />
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        No inquiries received yet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Public Preview Modal */}
      {showPublicPreview && (
        <BuyerViewDetailsModal
          isOpen={showPublicPreview}
          onClose={() => setShowPublicPreview(false)}
          listing={listing}
        />
      )}

      {/* Accept Bid Confirmation Modal */}
      {showAcceptBidModal && selectedBid && (
        <AcceptBidConfirmationModal
          isOpen={showAcceptBidModal}
          onClose={() => setShowAcceptBidModal(false)}
          onConfirm={handleConfirmAcceptBid}
          bid={{
            bidderName: selectedBid.bidderName,
            bidderCompany: selectedBid.bidderName,
            amount: selectedBid.bidAmount
          }}
          listing={{
            cropName: listing.cropName,
            variety: listing.variety,
            quantity: listing.quantity,
            unit: listing.unit
          }}
        />
      )}

      {/* Extend Auction Modal */}
      {showExtendAuctionModal && (
        <ExtendAuctionModal
          isOpen={showExtendAuctionModal}
          onClose={() => setShowExtendAuctionModal(false)}
          onConfirm={handleExtendAuction}
          listing={{
            cropName: listing.cropName,
            variety: listing.variety,
            auctionEndDate: extendedAuctionEndDate
          }}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md">
          Bid accepted successfully!
        </div>
      )}
    </div>
  );
}