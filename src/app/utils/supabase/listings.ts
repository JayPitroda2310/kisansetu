import { supabase } from './client';

export interface Listing {
  id: string;
  seller_id: string;
  product_name: string;
  variety: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_type: 'auction' | 'fixed' | 'both';
  fixed_price?: number;
  starting_bid?: number;
  current_bid?: number;
  min_bid_increment?: number;
  max_bid_increment?: number;
  reserve_price?: number;
  auction_start_time?: string;
  auction_end_time?: string;
  description: string;
  quality_grade?: string;
  harvest_date?: string;
  images: string[];
  location: string;
  state: string;
  district: string;
  status: 'draft' | 'active' | 'sold' | 'expired' | 'cancelled';
  is_partial_order_allowed: boolean;
  views_count: number;
  created_at: string;
}

// Get all active listings
export const getActiveListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:user_profiles(full_name, location, rating)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Get listing by ID
export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:user_profiles(full_name, phone, location, rating, total_transactions)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Increment view count
  await supabase
    .from('listings')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id);

  return data;
};

// Create new listing
export const createListing = async (listingData: Partial<Listing>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...listingData,
      seller_id: user.id,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update listing
export const updateListing = async (id: string, updates: Partial<Listing>) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get seller's listings
export const getSellerListings = async (sellerId: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Search listings
export const searchListings = async (query: string, filters?: {
  category?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  let queryBuilder = supabase
    .from('listings')
    .select(`
      *,
      seller:user_profiles(full_name, location, rating)
    `)
    .eq('status', 'active')
    .ilike('product_name', `%${query}%`);

  if (filters?.category) {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }
  if (filters?.state) {
    queryBuilder = queryBuilder.eq('state', filters.state);
  }
  if (filters?.minPrice) {
    queryBuilder = queryBuilder.gte('fixed_price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    queryBuilder = queryBuilder.lte('fixed_price', filters.maxPrice);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
};
