import { useState, useEffect } from 'react';
import { SellerViewDetailsModal } from './SellerViewDetailsModal';
import { supabase } from '../../utils/supabase/client';
import { getListingBids, acceptBid as acceptBidInDB, subscribeToBids } from '../../utils/supabase/bids';
import { updateListing } from '../../utils/supabase/listings';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SellerViewDetailsModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  listingId: string;
  onListingUpdated?: () => void;
}

export function SellerViewDetailsModalWrapper({ 
  isOpen, 
  onClose, 
  onNavigate, 
  listingId,
  onListingUpdated 
}: SellerViewDetailsModalWrapperProps) {
  const [listing, setListing] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (isOpen && listingId) {
      fetchListingDetails();
      fetchBids();
      fetchMessageCount();
    }
  }, [isOpen, listingId]);

  // Real-time bid subscription
  useEffect(() => {
    if (!isOpen || !listingId) return;

    console.log('Setting up real-time bid subscription for listing:', listingId);
    const unsubscribe = subscribeToBids(listingId, (newBid) => {
      console.log('Bid subscription triggered, refetching bids...');
      fetchBids(); // Refetch all bids when a new one comes in
    });

    return () => {
      console.log('Cleaning up bid subscription');
      unsubscribe();
    };
  }, [isOpen, listingId]);

  const fetchListingDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing details');
        return;
      }

      setListing(data);
    } catch (error) {
      console.error('Error in fetchListingDetails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      console.log('SellerViewDetailsModalWrapper: Fetching bids for listing', listingId);
      const bidsData = await getListingBids(listingId);
      console.log('SellerViewDetailsModalWrapper: Received bids data:', bidsData);
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const fetchMessageCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count messages related to this listing
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('listing_id', listingId);

      setMessageCount(count || 0);
    } catch (error) {
      console.error('Error fetching message count:', error);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await acceptBidInDB(bidId);
      toast.success('Bid accepted successfully!');
      
      // Refresh data
      await fetchListingDetails();
      await fetchBids();
      
      if (onListingUpdated) {
        onListingUpdated();
      }
    } catch (error: any) {
      console.error('Error accepting bid:', error);
      toast.error(error.message || 'Failed to accept bid');
    }
  };

  const handleExtendAuction = async (hours: number) => {
    try {
      if (!listing || !listing.auction_end_time) return;

      const currentEnd = new Date(listing.auction_end_time);
      const newEnd = new Date(currentEnd.getTime() + hours * 60 * 60 * 1000);

      await updateListing(listingId, {
        auction_end_time: newEnd.toISOString()
      });

      toast.success(`Auction extended by ${hours} hours!`);
      await fetchListingDetails();
      
      if (onListingUpdated) {
        onListingUpdated();
      }
    } catch (error: any) {
      console.error('Error extending auction:', error);
      toast.error(error.message || 'Failed to extend auction');
    }
  };

  const handleDeleteListing = async () => {
    try {
      await updateListing(listingId, { status: 'cancelled' });
      toast.success('Listing deleted successfully');
      onClose();
      
      if (onListingUpdated) {
        onListingUpdated();
      }
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8">
          <Loader2 className="w-8 h-8 text-[#64b900] animate-spin" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  // Convert Supabase listing format to component format
  const convertedListing = {
    id: listing.id,
    cropName: listing.product_name || 'Unknown',
    variety: listing.variety || '',
    grade: listing.quality_grade || 'N/A',
    harvestDate: listing.harvest_date || new Date().toISOString(),
    quantity: listing.quantity || 0,
    quantityRemaining: listing.quantity || 0, // TODO: Calculate from orders
    unit: listing.unit || 'Quintal',
    orderType: listing.is_partial_order_allowed ? 'partial' as const : 'whole' as const,
    saleType: (listing.purchase_type === 'auction' || listing.purchase_type === 'both') ? 'auction' as const : 'fixed' as const,
    pricePerUnit: listing.fixed_price || listing.starting_bid || 0,
    totalPrice: (listing.fixed_price || listing.starting_bid || 0) * (listing.quantity || 0),
    minimumBidIncrement: listing.min_bid_increment || 0,
    auctionEndDate: listing.auction_end_time,
    auctionStartDate: listing.auction_start_time,
    location: { 
      district: listing.district || '', 
      state: listing.state || '',
      pincode: listing.location?.split(',')[2]?.trim() || ''
    },
    packagingType: 'Standard Packaging', // TODO: Add to database
    storageType: 'Cold Storage', // TODO: Add to database
    pickupMethod: 'buyer', // TODO: Add to database
    description: listing.description || '',
    images: listing.images || [],
    certificate: listing.certificate_url,
    moq: listing.moq,
    moqPrice: listing.moq_price,
    status: listing.status || 'active',
    postedDate: listing.created_at,
    listingId: listing.id.substring(0, 8).toUpperCase(),
    stats: {
      views: listing.views_count || 0,
      bids: bids.length,
      messages: messageCount,
      interested: 0 // TODO: Track inquiries
    },
    bids: bids.map((bid: any) => ({
      id: bid.id,
      bidderName: bid.bidder?.full_name || 'Anonymous Bidder',
      bidAmount: bid.amount,
      timestamp: new Date(bid.created_at).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: bid.status === 'active' && bid.amount === listing.current_bid ? 'leading' as const :
              bid.status === 'outbid' ? 'outbid' as const : 'active' as const
    }))
  };

  return (
    <SellerViewDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      onNavigate={onNavigate}
      listing={convertedListing}
      onAcceptBid={handleAcceptBid}
      onExtendAuction={handleExtendAuction}
      onDeleteListing={handleDeleteListing}
    />
  );
}