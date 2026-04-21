import { useState, useEffect } from 'react';
import { X, Package, MapPin, Calendar, Star, TrendingUp, Clock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BidConfirmationModal } from './BidConfirmationModal';
import { BidSuccessModal } from './BidSuccessModal';
import { PartialOrderSelectionModal } from './PartialOrderSelectionModal';
import { PartialOrderQuantityModal } from './PartialOrderQuantityModal';
import { BidHistoryModal } from './BidHistoryModal';
import { placeBid, getListingBids, subscribeToBids } from '../../utils/supabase/bids';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string; // Add listing ID
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
}

export function BidModal({ isOpen, onClose, listingId, product, auction, orderType = 'whole', moq, moqPrice }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState(0);
  const [bidIncrement, setBidIncrement] = useState(0); // User enters increment, not final bid
  const [timeLeft, setTimeLeft] = useState(0);
  const [showBidConfirmation, setShowBidConfirmation] = useState(false);
  const [showBidSuccess, setShowBidSuccess] = useState(false);
  const [showPartialOrderModal, setShowPartialOrderModal] = useState(false);
  const [showPartialQuantityModal, setShowPartialQuantityModal] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'whole' | 'partial' | null>(null);
  const [quantity, setQuantity] = useState(moq || 10);
  const [placedBidAmount, setPlacedBidAmount] = useState(0); // Store the actual bid amount that was placed

  // Real-time state from Supabase
  const [currentHighestBid, setCurrentHighestBid] = useState(0);
  const [minIncrement, setMinIncrement] = useState(auction.minIncrement);
  const [maxIncrement, setMaxIncrement] = useState(1000); // Add max increment
  const [auctionEndTime, setAuctionEndTime] = useState<string | null>(null);
  const [bidActivityList, setBidActivityList] = useState<Array<{
    bidder: string;
    amount: number;
    timeAgo: string;
    status: 'leading' | 'outbid';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUserHighestBidder, setIsCurrentUserHighestBidder] = useState(false);
  const [showBidHistory, setShowBidHistory] = useState(false); // State for bid history modal

  // Update bid increment and amount when current highest bid changes
  useEffect(() => {
    if (currentHighestBid > 0) {
      setBidIncrement(minIncrement);
      setBidAmount(currentHighestBid + minIncrement);
    }
  }, [currentHighestBid, minIncrement]);

  // Update bid amount when increment changes
  useEffect(() => {
    setBidAmount(currentHighestBid + bidIncrement);
  }, [bidIncrement, currentHighestBid]);

  // Fetch listing details and bids when modal opens
  useEffect(() => {
    if (!isOpen || !listingId) return;

    const fetchListingData = async () => {
      try {
        setLoading(true);

        console.log('BidModal: Fetching listing data for:', listingId);

        // Fetch listing details - ALWAYS fetch fresh from DB, ignore prop
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select('auction_end_time, current_bid, min_bid_increment, max_bid_increment, starting_bid, seller_id')
          .eq('id', listingId)
          .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

        if (listingError) {
          console.error('Error fetching listing:', listingError);
          throw listingError;
        }

        if (!listing) {
          console.error('Listing not found for ID:', listingId);
          toast.error('Listing not found or you do not have permission to view it.');
          setLoading(false);
          onClose();
          return;
        }

        if (listing) {
          console.log('BidModal: Fetched listing data:', listing);
          console.log('BidModal: Current bid from DB:', listing.current_bid);
          console.log('BidModal: Auction end time:', listing.auction_end_time);

          setAuctionEndTime(listing.auction_end_time);

          // ALWAYS use the DB value, not the prop
          const highestBid = listing.current_bid || listing.starting_bid || 0;
          console.log('BidModal: Setting current highest bid to:', highestBid);

          setCurrentHighestBid(highestBid);
          const minInc = listing.min_bid_increment || auction.minIncrement || 10;
          const maxInc = listing.max_bid_increment || 1000; // Fallback if column doesn't exist yet
          setMinIncrement(minInc);
          setMaxIncrement(maxInc);
          setBidIncrement(minInc);
          setBidAmount(highestBid + minInc);

          // Calculate initial time left
          if (listing.auction_end_time) {
            const now = new Date();
            const end = new Date(listing.auction_end_time);
            const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
            console.log('BidModal: Calculated time left (seconds):', diff);
            setTimeLeft(diff);
          }
        }

        // Fetch all bids for this listing
        const bids = await getListingBids(listingId);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Transform bids to bid activity format
        const transformedBids = bids.map((bid: any, index: number) => {
          const isCurrentUser = user && bid.bidder_id === user.id;
          const bidderName = isCurrentUser ? 'You' : (bid.bidder?.full_name || 'Anonymous');
          
          // Calculate time ago
          const bidTime = new Date(bid.created_at);
          const now = new Date();
          const diffMs = now.getTime() - bidTime.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          let timeAgo = 'Just now';
          if (diffMins < 1) {
            timeAgo = 'Just now';
          } else if (diffMins < 60) {
            timeAgo = `${diffMins} min ago`;
          } else if (diffHours < 24) {
            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          }

          return {
            bidder: bidderName,
            amount: bid.amount,
            timeAgo,
            status: index === 0 ? 'leading' as const : 'outbid' as const
          };
        });

        setBidActivityList(transformedBids);
        
        // Check if current user is the highest bidder
        if (user && transformedBids.length > 0 && bids[0].bidder_id === user.id) {
          setIsCurrentUserHighestBidder(true);
        } else {
          setIsCurrentUserHighestBidder(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listing data:', error);
        toast.error('Failed to load auction details');
        setLoading(false);
      }
    };

    fetchListingData();
  }, [isOpen, listingId, auction.currentHighestBid, auction.minIncrement]);

  // Subscribe to real-time bid updates
  useEffect(() => {
    if (!isOpen || !listingId) return;

    console.log('=== Setting up real-time subscriptions for listing:', listingId);

    // Function to check and update highest bidder status
    const checkHighestBidder = async () => {
      try {
        const bids = await getListingBids(listingId);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const highestBidderId = bids.length > 0 ? bids[0].bidder_id : null;
        const isUserHighest = highestBidderId === user.id;
        
        console.log('🔄 Manual check - Highest bidder ID:', highestBidderId);
        console.log('🔄 Manual check - Current user ID:', user.id);
        console.log('🔄 Manual check - Is user highest?', isUserHighest);
        
        setIsCurrentUserHighestBidder(isUserHighest);
        
        // Also update the current highest bid
        if (bids.length > 0) {
          setCurrentHighestBid(bids[0].amount);
          
          // Update bid activity list
          const transformedBids = bids.map((bid: any, index: number) => {
            const isCurrentUser = bid.bidder_id === user.id;
            const bidderName = isCurrentUser ? 'You' : (bid.bidder?.full_name || 'Anonymous');
            
            const bidTime = new Date(bid.created_at);
            const now = new Date();
            const diffMs = now.getTime() - bidTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            let timeAgo = 'Just now';
            if (diffMins < 1) {
              timeAgo = 'Just now';
            } else if (diffMins < 60) {
              timeAgo = `${diffMins} min ago`;
            } else if (diffHours < 24) {
              timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
              timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }

            return {
              bidder: bidderName,
              amount: bid.amount,
              timeAgo,
              status: index === 0 ? 'leading' as const : 'outbid' as const
            };
          });
          
          setBidActivityList(transformedBids);
        }
      } catch (error) {
        console.error('❌ Error checking highest bidder:', error);
      }
    };

    // Poll every 2 seconds to check for updates (fallback if real-time doesn't work)
    const pollInterval = setInterval(checkHighestBidder, 2000);

    // Subscribe to new bids
    const unsubscribeBids = subscribeToBids(listingId, async (newBid) => {
      console.log('🔔 NEW BID RECEIVED:', newBid);
      await checkHighestBidder();
    });

    // Subscribe to listing changes (for current_bid updates)
    const listingChannel = supabase
      .channel(`listing-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'listings',
          filter: `id=eq.${listingId}`,
        },
        async (payload) => {
          const updatedListing = payload.new as any;
          if (updatedListing.current_bid) {
            console.log('Listing updated, new current_bid:', updatedListing.current_bid);
            setCurrentHighestBid(updatedListing.current_bid);
            
            // Re-fetch bids to check if current user is still the highest bidder
            try {
              const bids = await getListingBids(listingId);
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user && bids.length > 0 && bids[0].bidder_id === user.id) {
                console.log('Current user is highest bidder');
                setIsCurrentUserHighestBidder(true);
              } else {
                console.log('Current user is NOT highest bidder');
                setIsCurrentUserHighestBidder(false);
              }
            } catch (error) {
              console.error('Error checking highest bidder:', error);
            }
          }
          if (updatedListing.auction_end_time) {
            setAuctionEndTime(updatedListing.auction_end_time);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      unsubscribeBids();
      supabase.removeChannel(listingChannel);
    };
  }, [isOpen, listingId]);

  // Countdown timer based on auction_end_time
  useEffect(() => {
    if (!isOpen || !auctionEndTime) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(auctionEndTime);
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, auctionEndTime]);

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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlaceBid = () => {
    // Prevent consecutive bids - user must wait for another bidder
    if (isCurrentUserHighestBidder) {
      toast.error('You are currently the highest bidder. Please wait for another bidder to place a bid before bidding again.');
      return;
    }

    // Validate bid increment is within allowed range
    if (bidIncrement < minIncrement) {
      toast.error(`Bid increment must be at least ₹${minIncrement}`);
      return;
    }

    if (bidIncrement > maxIncrement) {
      toast.error(`Bid increment cannot exceed ₹${maxIncrement}`);
      return;
    }

    // Auctions are always whole lot, go directly to bid confirmation
    setShowBidConfirmation(true);
  };

  const handlePartialOrderWholeLot = () => {
    setSelectedOrderType('whole');
    setShowPartialOrderModal(false);
    setShowBidConfirmation(true);
  };

  const handlePartialOrderPartial = () => {
    setSelectedOrderType('partial');
    setShowPartialOrderModal(false);
    setShowPartialQuantityModal(true);
  };

  const handleConfirmBid = async () => {
    if (!listingId) {
      toast.error('Unable to place bid: Listing ID missing');
      return;
    }

    try {
      // Store the actual bid amount that was placed BEFORE placing the bid
      setPlacedBidAmount(bidAmount);
      
      // Place bid in Supabase
      const actualQuantity = selectedOrderType === 'partial' ? quantity : totalQuantity;
      const result = await placeBid(listingId, bidAmount, actualQuantity);
      
      console.log('Bid placed successfully:', result);
      
      setShowBidConfirmation(false);
      setShowBidSuccess(true);
      toast.success('Bid placed successfully! Check "My Biddings" to see your bid.');
      
      // No need to manually update the bid list - real-time subscription will handle it
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(error.message || 'Failed to place bid');
      setShowBidConfirmation(false);
    }
  };

  const handleSetAutoBid = () => {
    console.log('Setting auto bid');
    // Handle auto bid logic
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Bid Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={() => {
            if (!showBidConfirmation && !showBidSuccess && !showPartialOrderModal && !showPartialQuantityModal) {
              onClose();
            }
          }}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-2xl max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Live Auction</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Whole Lot Auction Mode
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-semibold text-[#64b900]">Auction Active</span>
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
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
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
                          <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
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
                        <div className="col-span-2">
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

                {/* Auction Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Information</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Base Price (per kg)</p>
                      <p className="text-2xl font-bold text-gray-900">₹{auction.basePrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Lot Value (Base)</p>
                      <p className="text-2xl font-bold text-gray-900">₹{auction.totalLotValue?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Min Bid Increment</p>
                      <p className="text-2xl font-bold text-[#64b900]">₹{minIncrement}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Max Bid Increment</p>
                      <p className="text-2xl font-bold text-blue-600">₹{maxIncrement}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Highest Bid (per kg)</p>
                        <p className="text-3xl font-bold text-[#64b900]">₹{currentHighestBid}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Total: <span className="font-semibold">₹{(currentHighestBid * parseQuantity(product.quantity))?.toLocaleString() || '0'}</span>
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

                {/* Bid Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Bid Activity</h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#64b900] rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading bid activity...</p>
                    </div>
                  ) : bidActivityList.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No bids placed yet. Be the first to bid!</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Bidder</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Bid Amount (per kg)</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Time Placed</th>
                              <th className="text-left text-sm font-semibold text-gray-700 pb-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bidActivityList.slice(0, 5).map((bid, index) => (
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

                      {bidActivityList.length > 5 && (
                        <button 
                          className="w-full mt-4 text-sm text-[#64b900] hover:underline font-medium" 
                          onClick={() => setShowBidHistory(true)}
                        >
                          View Full History ({bidActivityList.length} total bids)
                        </button>
                      )}
                      
                      {bidActivityList.length <= 5 && (
                        <p className="text-center text-xs text-gray-500 mt-4">
                          Showing all {bidActivityList.length} bid{bidActivityList.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Place Bid */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-[#64b900] rounded-lg p-5 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>

                  {/* Current Highest Bid */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
                    <p className="text-3xl font-bold text-gray-900">₹{currentHighestBid}</p>
                    <p className="text-sm text-gray-500 mt-1">per kg</p>
                  </div>

                  {/* Bid Increment Range */}
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 font-medium mb-1">Allowed Bid Increment Range</p>
                      <p className="text-lg font-bold text-blue-900">
                        ₹{minIncrement} - ₹{maxIncrement}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Set by seller
                      </p>
                    </div>
                  </div>

                  {/* Bid Increment Input */}
                  <div className="mb-4">
                    <label htmlFor="bidIncrement" className="text-sm font-medium text-gray-700 mb-2 block">
                      Enter Your Bid Increment (per kg) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        id="bidIncrement"
                        type="number"
                        value={bidIncrement}
                        onChange={(e) => setBidIncrement(Number(e.target.value))}
                        min={minIncrement}
                        max={maxIncrement}
                        className="w-full pl-7 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#64b900] focus:ring-2 focus:ring-[#64b900]/20 focus:outline-none text-lg font-semibold"
                        placeholder={`₹${minIncrement} - ₹${maxIncrement}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter an increment between ₹{minIncrement} and ₹{maxIncrement}
                    </p>
                  </div>

                  {/* Auto-calculated Total Bid */}
                  <div className="mb-4">
                    <div className="bg-gradient-to-r from-[#64b900]/10 to-[#64b900]/5 border-2 border-[#64b900] rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Your Total Bid (per kg)</p>
                      <p className="text-3xl font-bold text-[#64b900]">₹{bidAmount}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        = Current Highest (₹{currentHighestBid}) + Your Increment (₹{bidIncrement})
                      </p>
                      <div className="border-t border-[#64b900]/30 mt-3 pt-3">
                        <p className="text-sm text-gray-600 mb-1">Total for Entire Lot</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{(bidAmount * parseQuantity(product.quantity)).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {parseQuantity(product.quantity)} {parseUnit(product.quantity)} × ₹{bidAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {isCurrentUserHighestBidder && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 font-medium">
                          ✓ You are currently the highest bidder. Wait for another bidder to place a bid before you can bid again.
                        </p>
                      </div>
                    )}

                    {/* Validation message for invalid increment */}
                    {!isCurrentUserHighestBidder && (bidIncrement < minIncrement || bidIncrement > maxIncrement) && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-800 font-medium">
                          {bidIncrement < minIncrement
                            ? `Increment must be at least ₹${minIncrement}`
                            : `Increment cannot exceed ₹${maxIncrement}`}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handlePlaceBid}
                      disabled={bidIncrement < minIncrement || bidIncrement > maxIncrement || isCurrentUserHighestBidder}
                      className={`w-full font-semibold py-4 px-6 rounded-lg text-base transition-colors ${
                        isCurrentUserHighestBidder
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : bidIncrement < minIncrement || bidIncrement > maxIncrement
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#64b900] hover:bg-[#559900] text-white'
                      }`}
                    >
                      {isCurrentUserHighestBidder ? 'You Are Leading' : 'Place Bid'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partial Order Selection Modal */}
      {orderType === 'partial' && (
        <PartialOrderSelectionModal
          isOpen={showPartialOrderModal}
          onClose={() => setShowPartialOrderModal(false)}
          onSelectWholeLot={handlePartialOrderWholeLot}
          onSelectPartialOrder={handlePartialOrderPartial}
          listing={{
            cropName: product.name,
            quantity: totalQuantity,
            unit: unit,
            moq: moq,
            moqPrice: moqPrice,
            pricePerUnit: auction.currentHighestBid,
            saleType: 'auction'
          }}
        />
      )}

      {/* Partial Order Quantity Modal */}
      {orderType === 'partial' && moq && moqPrice && (
        <PartialOrderQuantityModal
          isOpen={showPartialQuantityModal}
          onClose={() => setShowPartialQuantityModal(false)}
          onConfirm={(selectedQty) => {
            setQuantity(selectedQty);
            setShowPartialQuantityModal(false);
            setShowBidConfirmation(true);
          }}
          listing={{
            cropName: product.name,
            quantity: totalQuantity,
            unit: unit,
            moq: moq,
            moqPrice: moqPrice,
            saleType: 'auction'
          }}
        />
      )}

      {/* Bid Confirmation Modal */}
      <BidConfirmationModal
        isOpen={showBidConfirmation}
        onClose={() => {
          console.log('BidConfirmationModal onClose called - going back to auction');
          setShowBidConfirmation(false);
        }}
        onCancel={() => {
          console.log('BidConfirmationModal onCancel called - going back to auction');
          setShowBidConfirmation(false);
        }}
        onConfirm={handleConfirmBid}
        cropName={product.name}
        bidAmountPerKg={bidAmount}
        quantity={selectedOrderType === 'partial' ? quantity : parseQuantity(product.quantity)}
      />

      {/* Bid Success Modal */}
      <BidSuccessModal
        isOpen={showBidSuccess}
        onClose={() => setShowBidSuccess(false)}
        onContinueBidding={() => {
          setShowBidSuccess(false);
          // Keep the bid modal open so user can place another bid
        }}
        cropName={product.name}
        bidAmountPerKg={placedBidAmount} // Use the actual bid amount that was placed
      />

      {/* Bid History Modal */}
      <BidHistoryModal
        isOpen={showBidHistory}
        onClose={() => setShowBidHistory(false)}
        listingId={listingId || ''}
        productName={product.name}
      />
    </>
  );
}