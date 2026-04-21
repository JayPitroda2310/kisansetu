import { supabase } from './client';

export interface MarketplaceListing {
  id: string;
  image: string;
  cropName: string;
  variety: string;
  seller: string;
  sellerRating: number;
  basePrice: number;
  unit: string;
  quantity: number;
  location: string;
  timeLeft: string;
  currentBid: number;
  saleType: 'auction' | 'fixed';
  orderType: 'whole' | 'partial';
  moq?: number;
  moqPrice?: number;
  sellerId: string;
}

/**
 * Get all active marketplace listings (for buyers)
 */
export async function getMarketplaceListings(): Promise<{ data: MarketplaceListing[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get all active listings (exclude sold, cancelled, expired listings)
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .in('status', ['active']) // Only show active listings (not sold, cancelled, or expired)
      .order('created_at', { ascending: false});

    if (listingsError) {
      console.error('Error fetching marketplace listings:', listingsError);
      return { data: null, error: listingsError };
    }

    if (!listings || listings.length === 0) {
      return { data: [], error: null };
    }

    // Get seller details for each listing
    const listingsWithDetails = await Promise.all(
      listings
        .filter(listing => {
          // Exclude current user's own listings and sold listings
          return (!user || listing.seller_id !== user.id) && listing.status !== 'sold';
        })
        .map(async (listing) => {
          // Get seller info
          let seller = { full_name: 'Unknown Seller', rating: 0 };
          if (listing.seller_id) {
            const { data: sellerData } = await supabase
              .from('user_profiles')
              .select('full_name, rating')
              .eq('id', listing.seller_id)
              .maybeSingle(); // Changed from .single() to avoid error on 0 rows
            
            if (sellerData) {
              seller = sellerData;
            }
          }

          // Calculate time left for auctions
          let timeLeft = '';
          if (listing.purchase_type === 'auction' && listing.auction_end_time) {
            const now = new Date();
            const end = new Date(listing.auction_end_time);
            const diff = end.getTime() - now.getTime();
            
            if (diff > 0) {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              timeLeft = `${hours}h ${minutes}m`;
            } else {
              timeLeft = 'Ended';
            }
          }

          // Determine sale type
          const saleType: 'auction' | 'fixed' = 
            listing.purchase_type === 'auction' || listing.purchase_type === 'both' 
              ? 'auction' 
              : 'fixed';

          // Determine current price/bid
          const currentBid = saleType === 'auction' 
            ? (listing.current_bid || listing.starting_bid || listing.fixed_price || 0)
            : (listing.fixed_price || 0);

          return {
            id: listing.id,
            image: listing.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
            cropName: listing.product_name,
            variety: listing.variety || 'N/A',
            seller: seller.full_name,
            sellerRating: seller.rating || 4.5,
            basePrice: saleType === 'auction' 
              ? (listing.starting_bid || listing.fixed_price || 0)
              : (listing.fixed_price || 0),
            unit: listing.unit,
            quantity: listing.quantity,
            location: `${listing.district || listing.location}${listing.state ? ', ' + listing.state : ''}`,
            timeLeft,
            currentBid,
            saleType,
            orderType: listing.is_partial_order_allowed ? 'partial' : 'whole',
            moq: listing.is_partial_order_allowed ? Math.ceil(listing.quantity * 0.1) : undefined,
            moqPrice: listing.is_partial_order_allowed ? currentBid * 0.95 : undefined,
            sellerId: listing.seller_id
          };
        })
    );

    return { data: listingsWithDetails, error: null };
  } catch (error) {
    console.error('Error in getMarketplaceListings:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to listings changes
 */
export function subscribeToListings(callback: () => void) {
  const channel = supabase
    .channel('listings-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'listings'
      },
      () => {
        console.log('Listings changed - triggering callback');
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Listings subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get listing statistics for market insights
 */
export async function getMarketStats(): Promise<{ 
  liveAuctionsCount: number;
  topTradedCrop: string;
  error: any;
}> {
  try {
    // Get count of active auctions
    const { count: auctionCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .in('purchase_type', ['auction', 'both']);

    // Get most common crop
    const { data: crops } = await supabase
      .from('listings')
      .select('product_name')
      .eq('status', 'active')
      .limit(100);

    let topCrop = 'Wheat';
    if (crops && crops.length > 0) {
      const cropCounts: Record<string, number> = {};
      crops.forEach(c => {
        cropCounts[c.product_name] = (cropCounts[c.product_name] || 0) + 1;
      });
      
      const sorted = Object.entries(cropCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        topCrop = sorted[0][0];
      }
    }

    return {
      liveAuctionsCount: auctionCount || 0,
      topTradedCrop: topCrop,
      error: null
    };
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return {
      liveAuctionsCount: 0,
      topTradedCrop: 'Wheat',
      error
    };
  }
}