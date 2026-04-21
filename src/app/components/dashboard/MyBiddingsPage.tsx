import { useState, useEffect } from 'react';
import { Gavel, Clock, Package, MapPin, TrendingUp, CheckCircle, XCircle, AlertCircle, ChevronRight, User, X, AlertTriangle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { EscrowPaymentPage } from '../escrow/EscrowPaymentPage';
import { 
  getUserBids, 
  raiseBid, 
  withdrawBid, 
  calculateTimeRemaining, 
  formatTimeAgo,
  subscribeToBidUpdates,
  type BidWithDetails 
} from '../../utils/supabase/my-biddings';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface Bid {
  id: string;
  listingId: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  sellerName: string;
  location: string;
  productImage: string;
  bidAmount: number;
  bidDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'outbid';
  currentHighestBid?: number;
  auctionEndsIn?: string;
  isMyBidHighest?: boolean;
}

// Minimum bid increment (in INR)
const MINIMUM_BID_INCREMENT = 500;

interface MyBiddingsPageProps {
  onNavigate?: (view: string) => void;
}

export function MyBiddingsPage({ onNavigate }: MyBiddingsPageProps = {}) {
  const [biddings, setBiddings] = useState<Bid[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'outbid'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBidForPayment, setSelectedBidForPayment] = useState<Bid | null>(null);
  const [showRaiseBidModal, setShowRaiseBidModal] = useState(false);
  const [selectedBidForRaise, setSelectedBidForRaise] = useState<Bid | null>(null);
  const [showBidSuccessModal, setShowBidSuccessModal] = useState(false);
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
  const [selectedBidForReject, setSelectedBidForReject] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  // Load bids from Supabase
  useEffect(() => {
    loadBids();

    // Subscribe to real-time updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return subscribeToBidUpdates(user.id, () => {
        loadBids();
      });
    };

    let subscription: any;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      const { data, error } = await getUserBids();
      
      if (error) {
        console.error('Error loading bids:', error);
        toast.error('Failed to load bids');
        return;
      }

      if (data) {
        // Transform Supabase data to component format
        const transformedBids: Bid[] = data.map((bid) => {
          const isMyBidHighest = bid.listing.current_bid === bid.amount;
          
          // Map database status to UI status
          let uiStatus: 'pending' | 'accepted' | 'rejected' | 'outbid' = 'pending';
          if (bid.status === 'accepted') uiStatus = 'accepted';
          else if (bid.status === 'rejected') uiStatus = 'rejected';
          else if (bid.status === 'outbid') uiStatus = 'outbid';
          else if (bid.status === 'active' && !isMyBidHighest && bid.listing.current_bid && bid.listing.current_bid > bid.amount) {
            uiStatus = 'outbid';
          }

          return {
            id: bid.id,
            listingId: bid.listing_id,
            productName: bid.listing.product_name,
            variety: bid.listing.variety || 'N/A',
            quantity: bid.quantity || bid.listing.quantity,
            unit: bid.listing.unit,
            sellerName: bid.seller.full_name,
            location: `${bid.listing.location}${bid.listing.state ? ', ' + bid.listing.state : ''}`,
            productImage: bid.listing.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
            bidAmount: bid.amount,
            bidDate: formatTimeAgo(bid.created_at),
            status: uiStatus,
            currentHighestBid: bid.listing.current_bid || undefined,
            auctionEndsIn: calculateTimeRemaining(bid.listing.auction_end_time),
            isMyBidHighest
          };
        });

        setBiddings(transformedBids);
      }
    } catch (error) {
      console.error('Error loading bids:', error);
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
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

  const filteredBiddings = filterStatus === 'all' 
    ? biddings 
    : biddings.filter(bid => bid.status === filterStatus);

  const handlePayNow = (bid: Bid) => {
    setSelectedBidForPayment(bid);
    setShowPaymentModal(true);
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setSelectedBidForPayment(null);
  };

  const handleRejectBid = (bid: Bid) => {
    setSelectedBidForReject(bid);
    setShowRejectConfirmModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedBidForReject) return;
    
    // Remove the bid from the list
    setBiddings(prevBiddings => prevBiddings.filter(bid => bid.id !== selectedBidForReject.id));
    setShowRejectConfirmModal(false);
    setSelectedBidForReject(null);
  };

  const handleRaiseBid = (bid: Bid) => {
    setSelectedBidForRaise(bid);
    setShowRaiseBidModal(true);
  };

  const handleConfirmRaiseBid = () => {
    if (!selectedBidForRaise) return;

    const newBidAmount = (selectedBidForRaise.currentHighestBid || 0) + MINIMUM_BID_INCREMENT;

    // Update the bid in the list
    setBiddings(prevBiddings =>
      prevBiddings.map(bid =>
        bid.id === selectedBidForRaise.id
          ? {
              ...bid,
              bidAmount: newBidAmount,
              currentHighestBid: newBidAmount,
              isMyBidHighest: true,
              bidDate: 'Just now'
            }
          : bid
      )
    );

    // Raise the bid in the database
    raiseBid(selectedBidForRaise.id, newBidAmount);

    setShowRaiseBidModal(false);
    setShowBidSuccessModal(true);
    setTimeout(() => setShowBidSuccessModal(false), 3000);
  };

  const getStatusBadge = (status: string, isHighest?: boolean) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <CheckCircle className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'pending':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium ${
            isHighest ? 'bg-[#64b900]/10 text-[#64b900]' : 'bg-yellow-100 text-yellow-700'
          }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <Clock className="w-3.5 h-3.5" />
            {isHighest ? 'Highest Bid' : 'Pending'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'outbid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <AlertCircle className="w-3.5 h-3.5" />
            Outbid
          </span>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: biddings.length,
    pending: biddings.filter(b => b.status === 'pending').length,
    accepted: biddings.filter(b => b.status === 'accepted').length,
    totalValue: biddings.reduce((sum, bid) => sum + bid.bidAmount, 0)
  };

  if (showPaymentModal && selectedBidForPayment) {
    return (
      <EscrowPaymentPage
        orderDetails={{
          productName: selectedBidForPayment.productName,
          variety: selectedBidForPayment.variety,
          quantity: selectedBidForPayment.quantity,
          unit: selectedBidForPayment.unit,
          pricePerUnit: selectedBidForPayment.bidAmount / selectedBidForPayment.quantity,
          totalPrice: selectedBidForPayment.bidAmount,
          sellerName: selectedBidForPayment.sellerName,
          sellerLocation: selectedBidForPayment.location,
          expectedDelivery: '5-7 business days',
          productImage: selectedBidForPayment.productImage
        }}
        onCancel={handleClosePayment}
        onViewOrderStatus={() => {
          handleClosePayment();
          if (onNavigate) {
            onNavigate('order-history');
          }
        }}
        onGoToDashboard={() => {
          handleClosePayment();
          if (onNavigate) {
            onNavigate('dashboard');
          }
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 font-semibold mb-2">
              My Biddings
            </h1>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Track all your bids and their status
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#64b900]/10 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-[#64b900]" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.total}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Total Bids
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.pending}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Pending
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.accepted}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Accepted
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#64b900] p-5 bg-[#64b900]/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#64b900] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xl font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {formatCurrency(stats.totalValue)}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Total Bid Value
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-2">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'accepted', 'rejected', 'outbid'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-[#64b900] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Bids' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bidding Cards */}
        {filteredBiddings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-2">
              No Bids Found
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {filterStatus === 'all' 
                ? "You haven't placed any bids yet." 
                : `No ${filterStatus} bids found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBiddings.map((bid) => (
              <div key={bid.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <ImageWithFallback
                    src={bid.productImage}
                    alt={bid.productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(bid.status, bid.isMyBidHighest)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-1">
                      {bid.productName} - {bid.variety}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Quantity:
                        </span>
                        <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                          {bid.quantity} {bid.unit}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Your Bid:
                          </span>
                          <span className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-[#64b900]">
                            {formatCurrency(bid.bidAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Per {bid.unit}:
                          </span>
                          <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">
                            {formatCurrency(bid.bidAmount / bid.quantity)}
                          </span>
                        </div>
                      </div>

                      {bid.currentHighestBid && bid.currentHighestBid > bid.bidAmount && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-['Geologica:Regular',sans-serif] text-xs text-orange-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Current Highest:
                            </span>
                            <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-orange-700">
                              {formatCurrency(bid.currentHighestBid)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seller Info */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {bid.sellerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {bid.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Bid placed {bid.bidDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="space-y-2 mt-auto">
                    {bid.status === 'pending' && !bid.isMyBidHighest && (
                      <button 
                        onClick={() => handleRaiseBid(bid)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Raise Bid
                      </button>
                    )}

                    {bid.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePayNow(bid)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Pay Now
                        </button>
                        <button 
                          onClick={() => handleRejectBid(bid)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Bid Modal */}
      {showRaiseBidModal && selectedBidForRaise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
                Raise Your Bid
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {selectedBidForRaise.productName} - {selectedBidForRaise.variety}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Current Highest Bid:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                  {formatCurrency(selectedBidForRaise.currentHighestBid || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Your Current Bid:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-orange-600">
                  {formatCurrency(selectedBidForRaise.bidAmount)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                  New Bid Amount:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-[#64b900]">
                  {formatCurrency((selectedBidForRaise.currentHighestBid || 0) + MINIMUM_BID_INCREMENT)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Your bid will be increased by {formatCurrency(MINIMUM_BID_INCREMENT)} to match the minimum bid increment.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRaiseBidModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRaiseBid}
                className="flex-1 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirmModal && selectedBidForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
                Reject Accepted Bid?
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Are you sure you want to reject this bid for {selectedBidForReject.productName}?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Product:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-900">
                  {selectedBidForReject.productName} - {selectedBidForReject.variety}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Bid Amount:
                </span>
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-[#64b900]">
                  {formatCurrency(selectedBidForReject.bidAmount)}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-yellow-800" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                This action cannot be undone. The bid will be permanently removed from your biddings list.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirmModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showBidSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-[#64b900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#64b900]" />
            </div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
              Bid Raised Successfully!
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Your bid has been increased. You're now the highest bidder!
            </p>
          </div>
        </div>
      )}
    </>
  );
}