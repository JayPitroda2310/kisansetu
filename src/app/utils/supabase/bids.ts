import { supabase } from './client';
import { createNotification } from './notifications';

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  quantity?: number;
  message?: string;
  status: 'active' | 'withdrawn' | 'accepted' | 'rejected' | 'outbid';
  created_at: string;
}

// Place a bid
export const placeBid = async (
  listingId: string,
  amount: number,
  quantity?: number,
  message?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get listing details
  const { data: listing } = await supabase
    .from('listings')
    .select('*, seller_id')
    .eq('id', listingId)
    .single();

  if (!listing) throw new Error('Listing not found');

  // Check if the last bid was placed by the same user (prevent consecutive bids)
  const { data: lastBid } = await supabase
    .from('bids')
    .select('bidder_id, amount')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to handle case where there are no bids

  if (lastBid && lastBid.bidder_id === user.id) {
    throw new Error('You cannot place consecutive bids. Please wait for another bidder to place a bid.');
  }

  // Validate bid amount
  if (listing.current_bid && amount <= listing.current_bid) {
    throw new Error('Bid must be higher than current bid');
  }

  // Mark previous highest bid as outbid
  if (listing.current_bid) {
    const { data: previousBids } = await supabase
      .from('bids')
      .select('*, bidder:user_profiles(full_name)')
      .eq('listing_id', listingId)
      .eq('status', 'active')
      .order('amount', { ascending: false })
      .limit(1);

    if (previousBids && previousBids.length > 0) {
      await supabase
        .from('bids')
        .update({ status: 'outbid' })
        .eq('id', previousBids[0].id);

      // Notify previous bidder they've been outbid (ignore RLS errors)
      try {
        await createNotification({
          user_id: previousBids[0].bidder_id,
          type: 'outbid',
          title: 'You\'ve been outbid!',
          message: `Someone placed a higher bid of ₹${amount.toLocaleString('en-IN')} on ${listing.product_name}`,
          listing_id: listingId,
        });
      } catch (notifError) {
        console.log('Notification failed (RLS):', notifError);
      }
    }
  }

  // Create new bid
  const { data: newBid, error: bidError } = await supabase
    .from('bids')
    .insert({
      listing_id: listingId,
      bidder_id: user.id,
      amount,
      quantity,
      message,
      status: 'active',
    })
    .select()
    .single();

  if (bidError) throw bidError;

  // Update listing current_bid using the database function (bypasses RLS)
  console.log('Updating listing current_bid to:', amount, 'for listing:', listingId);
  
  try {
    const { data, error: updateError } = await supabase.rpc('update_listing_current_bid', {
      p_listing_id: listingId,
      p_new_bid_amount: amount
    });

    if (updateError) {
      console.error('Error updating listing current_bid:', updateError);
      throw new Error(`Failed to update listing current_bid: ${updateError.message}`);
    }
    
    console.log('Successfully updated listing current_bid to:', amount);
  } catch (rpcError: any) {
    console.error('RPC Error updating listing current_bid:', rpcError);
    throw new Error(`Failed to update listing current_bid: ${rpcError.message}`);
  }

  // Notify seller of new bid (ignore RLS errors)
  try {
    await createNotification({
      user_id: listing.seller_id,
      type: 'bid_received',
      title: 'New Bid Received!',
      message: `New bid of ₹${amount.toLocaleString('en-IN')} on your ${listing.product_name} listing`,
      listing_id: listingId,
      bid_id: newBid.id,
    });
  } catch (notifError) {
    console.log('Notification failed (RLS):', notifError);
  }

  return newBid;
};

// Get bids for a listing
export const getListingBids = async (listingId: string) => {
  console.log('Fetching bids for listing:', listingId);
  
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:user_profiles(full_name, location, rating)
    `)
    .eq('listing_id', listingId)
    .order('amount', { ascending: false });

  if (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }
  
  console.log('Fetched bids:', data);
  return data;
};

// Get user's bids
export const getUserBids = async (userId: string) => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      listing:listings(product_name, variety, images, status)
    `)
    .eq('bidder_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Accept a bid
export const acceptBid = async (bidId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get bid details
  const { data: bid } = await supabase
    .from('bids')
    .select(`
      *,
      listing:listings(*),
      bidder:user_profiles(*)
    `)
    .eq('id', bidId)
    .single();

  if (!bid) throw new Error('Bid not found');

  // Update bid status
  await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);

  // Update listing status
  await supabase
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', bid.listing_id);

  // Reject other bids
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('listing_id', bid.listing_id)
    .neq('id', bidId);

  // Create order
  const orderNumber = `ORD-${Date.now()}`;
  const { data: order } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      listing_id: bid.listing_id,
      seller_id: user.id,
      buyer_id: bid.bidder_id,
      bid_id: bidId,
      product_name: bid.listing.product_name,
      variety: bid.listing.variety,
      quantity: bid.quantity || bid.listing.quantity,
      unit: bid.listing.unit,
      price_per_unit: bid.amount / (bid.quantity || bid.listing.quantity),
      total_amount: bid.amount,
      payment_status: 'pending',
      delivery_status: 'pending',
    })
    .select()
    .single();

  // Notify buyer
  try {
    await createNotification({
      user_id: bid.bidder_id,
      type: 'bid_accepted',
      title: 'Your Bid Was Accepted! 🎉',
      message: `Your bid of ₹${bid.amount.toLocaleString('en-IN')} for ${bid.listing.product_name} was accepted!`,
      listing_id: bid.listing_id,
      order_id: order.id,
    });
  } catch (notifError) {
    console.log('Notification failed (RLS):', notifError);
  }

  return order;
};

// Withdraw a bid
export const withdrawBid = async (bidId: string) => {
  const { error } = await supabase
    .from('bids')
    .update({ status: 'withdrawn' })
    .eq('id', bidId);

  if (error) throw error;
};

// Subscribe to real-time bid updates
export const subscribeToBids = (listingId: string, callback: (bid: Bid) => void) => {
  console.log(`Setting up bid subscription for listing: ${listingId}`);
  
  const channel = supabase
    .channel(`listing-${listingId}-bids`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `listing_id=eq.${listingId}`,
      },
      (payload) => {
        console.log('New bid received via subscription:', payload.new);
        callback(payload.new as Bid);
      }
    )
    .subscribe((status) => {
      console.log(`Bid subscription status for ${listingId}:`, status);
    });

  return () => {
    console.log(`Unsubscribing from bids for listing: ${listingId}`);
    supabase.removeChannel(channel);
  };
};