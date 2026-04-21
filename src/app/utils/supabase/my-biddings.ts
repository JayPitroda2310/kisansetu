import { supabase } from './client';

export interface BidWithDetails {
  id: string;
  listing_id: string;
  amount: number;
  quantity: number | null;
  message: string | null;
  status: 'active' | 'withdrawn' | 'accepted' | 'rejected' | 'outbid';
  created_at: string;
  listing: {
    id: string;
    product_name: string;
    variety: string;
    quantity: number;
    unit: string;
    current_bid: number | null;
    auction_end_time: string | null;
    images: string[] | null;
    location: string;
    state: string;
    seller_id: string;
  };
  seller: {
    id: string;
    full_name: string;
  };
}

/**
 * Get all bids placed by the current user
 */
export async function getUserBids(): Promise<{ data: BidWithDetails[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // First get all bids for the user
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*')
      .eq('bidder_id', user.id)
      .order('created_at', { ascending: false });

    if (bidsError) {
      console.error('Error fetching bids:', bidsError);
      return { data: null, error: bidsError };
    }

    if (!bids || bids.length === 0) {
      return { data: [], error: null };
    }

    // Get listing and seller details for each bid
    const bidsWithDetails = await Promise.all(
      bids.map(async (bid) => {
        const { data: listing } = await supabase
          .from('listings')
          .select('id, product_name, variety, quantity, unit, current_bid, auction_end_time, images, location, state, seller_id')
          .eq('id', bid.listing_id)
          .single();

        let seller = { id: '', full_name: 'Unknown Seller' };
        if (listing?.seller_id) {
          const { data: sellerData } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .eq('id', listing.seller_id)
            .single();
          
          if (sellerData) {
            seller = sellerData;
          }
        }

        return {
          id: bid.id,
          listing_id: bid.listing_id,
          amount: bid.amount,
          quantity: bid.quantity,
          message: bid.message,
          status: bid.status,
          created_at: bid.created_at,
          listing: listing || {
            id: bid.listing_id,
            product_name: 'Unknown Product',
            variety: '',
            quantity: 0,
            unit: '',
            current_bid: null,
            auction_end_time: null,
            images: null,
            location: '',
            state: '',
            seller_id: ''
          },
          seller
        };
      })
    );

    return { data: bidsWithDetails, error: null };
  } catch (error) {
    console.error('Error in getUserBids:', error);
    return { data: null, error };
  }
}

/**
 * Raise/Update a bid amount
 */
export async function raiseBid(
  bidId: string,
  newAmount: number
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .update({ 
        amount: newAmount,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      console.error('Error raising bid:', error);
      return { data: null, error };
    }

    // Also update the listing's current_bid if this is now the highest
    const { data: listing } = await supabase
      .from('listings')
      .select('current_bid, id, listing_id')
      .eq('id', data.listing_id)
      .single();

    if (listing && (!listing.current_bid || newAmount > listing.current_bid)) {
      await supabase
        .from('listings')
        .update({ current_bid: newAmount })
        .eq('id', data.listing_id);

      // Mark other bids as outbid
      await supabase
        .from('bids')
        .update({ status: 'outbid' })
        .eq('listing_id', data.listing_id)
        .neq('id', bidId)
        .eq('status', 'active');
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in raiseBid:', error);
    return { data: null, error };
  }
}

/**
 * Withdraw/Delete a bid
 */
export async function withdrawBid(bidId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('bids')
      .update({ 
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', bidId);

    if (error) {
      console.error('Error withdrawing bid:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in withdrawBid:', error);
    return { error };
  }
}

/**
 * Calculate time remaining for auction
 */
export function calculateTimeRemaining(auctionEndTime: string | null): string {
  if (!auctionEndTime) return 'No end time';
  
  const now = new Date();
  const end = new Date(auctionEndTime);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Format time ago
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

/**
 * Subscribe to bid status changes
 */
export function subscribeToBidUpdates(userId: string, callback: () => void) {
  // Use a unique channel name to avoid conflicts
  const channelName = `bid-updates-${userId}-${Date.now()}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bids',
        filter: `bidder_id=eq.${userId}`
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return channel;
}