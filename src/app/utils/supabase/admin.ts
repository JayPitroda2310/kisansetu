import { supabase } from './client';

/**
 * Admin utility functions for KisanSetu platform
 * Provides comprehensive data fetching and management for admin dashboard
 */

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function getAdminDashboardStats() {
  try {
    console.log('📊 Fetching admin dashboard stats...');

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) console.warn('⚠️ Error fetching users count:', usersError);

    // Get ALL listings count (not just active)
    const { count: allListings, error: allListingsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (allListingsError) console.warn('⚠️ Error fetching all listings count:', allListingsError);
    console.log('📋 Total listings in DB:', allListings);

    // Get active listings count
    const { count: activeListings, error: listingsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (listingsError) console.warn('⚠️ Error fetching active listings:', listingsError);
    console.log('✅ Active listings:', activeListings);

    // Get active auctions count
    const { count: activeAuctions, error: auctionsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('purchase_type', 'auction')
      .eq('status', 'active');

    if (auctionsError) console.warn('⚠️ Error fetching auctions:', auctionsError);

    // Get completed transactions count
    const { count: completedTransactions, error: transactionsError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (transactionsError) console.warn('⚠️ Error fetching transactions:', transactionsError);

    // Get escrow funds holding (sum of all pending/in-progress order amounts)
    const { data: escrowData, error: escrowError } = await supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['pending', 'in_progress', 'in_escrow']);

    if (escrowError) console.warn('⚠️ Error fetching escrow:', escrowError);

    const escrowFunds = escrowData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Calculate platform revenue (e.g., 2% of completed transaction amounts)
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    if (revenueError) console.warn('⚠️ Error fetching revenue:', revenueError);

    const platformRevenue = (revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0) * 0.02;

    console.log('✅ Dashboard stats loaded successfully');

    return {
      totalUsers: totalUsers || 0,
      activeListings: activeListings || 0,
      activeAuctions: activeAuctions || 0,
      completedTransactions: completedTransactions || 0,
      escrowFunds,
      platformRevenue,
      error: null
    };
  } catch (error) {
    console.error('❌ Error fetching admin dashboard stats:', error);
    return {
      totalUsers: 0,
      activeListings: 0,
      activeAuctions: 0,
      completedTransactions: 0,
      escrowFunds: 0,
      platformRevenue: 0,
      error
    };
  }
}

export async function getTransactionVolumeData(period: 'weekly' | 'monthly' | 'yearly') {
  try {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    // Determine date range based on period
    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
    } else if (period === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = 'week';
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupBy = 'month';
    }

    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data based on period
    return processTimeSeriesData(data || [], period);
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    return [];
  }
}

export async function getTopCommoditiesData(period: 'weekly' | 'monthly' | 'yearly') {
  try {
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const { data, error } = await supabase
      .from('listings')
      .select('product_name, category')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Count commodities
    const commodityCounts: Record<string, number> = {};
    data?.forEach(listing => {
      const commodity = listing.product_name || listing.category;
      commodityCounts[commodity] = (commodityCounts[commodity] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(commodityCounts)
      .map(([commodity, count], index) => ({
        id: `commodity-${index}-${commodity.toLowerCase().replace(/\s+/g, '-')}`,
        commodity,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 commodities
  } catch (error) {
    console.error('Error fetching top commodities:', error);
    return [];
  }
}

export async function getUserGrowthData(period: 'weekly' | 'monthly' | 'yearly') {
  try {
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    return processUserGrowthData(data || [], period);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    return [];
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers(filters?: {
  searchTerm?: string;
  verification?: 'all' | 'verified' | 'unverified';
  status?: 'all' | 'active' | 'suspended';
}) {
  try {
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        full_name,
        location,
        phone,
        role,
        kyc_status,
        created_at,
        total_transactions,
        rating
      `);

    // Apply filters
    if (filters?.verification === 'verified') {
      query = query.eq('kyc_status', 'verified');
    } else if (filters?.verification === 'unverified') {
      query = query.in('kyc_status', ['pending', 'submitted', 'rejected']);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Apply search filter on client side (if needed)
    let filteredData = data || [];
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.id?.toLowerCase().includes(term)
      );
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], error };
  }
}

// Removed updateUserStatus and verifyUser - these are now handled directly in components
// using kyc_status field instead of non-existent status/is_verified fields

// ============================================
// COMMODITY LISTINGS MANAGEMENT
// ============================================

export async function getAllListings(filters?: {
  status?: string;
  category?: string;
}) {
  try {
    console.log('📥 getAllListings called with filters:', filters);

    // Try simple query first without join
    let simpleQuery = supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      simpleQuery = simpleQuery.eq('status', filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      simpleQuery = simpleQuery.eq('category', filters.category);
    }

    const { data: listingsData, error: listingsError } = await simpleQuery;

    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      throw listingsError;
    }

    console.log('✅ Listings fetched:', listingsData?.length || 0, 'listings found');

    // If no listings, return empty array
    if (!listingsData || listingsData.length === 0) {
      console.log('⚠️ No listings found in database');
      return { data: [], error: null };
    }

    // Fetch seller info for each listing
    console.log('📥 Fetching seller information...');
    const listingsWithSellers = await Promise.all(
      listingsData.map(async (listing) => {
        const { data: sellerData, error: sellerError } = await supabase
          .from('user_profiles')
          .select('full_name, location, phone')
          .eq('id', listing.seller_id)
          .maybeSingle();

        if (sellerError) {
          console.warn('⚠️ Could not fetch seller for listing', listing.id, sellerError);
        }

        return {
          ...listing,
          seller: sellerData || null
        };
      })
    );

    console.log('✅ Listings with seller info:', listingsWithSellers.length);
    return { data: listingsWithSellers, error: null };
  } catch (error) {
    console.error('❌ Critical error in getAllListings:', error);
    return { data: [], error };
  }
}

export async function updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'cancelled') {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listingId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating listing status:', error);
    return { success: false, error };
  }
}

// ============================================
// TRANSACTIONS & ESCROW
// ============================================

export async function getAllTransactions(filters?: {
  status?: string;
}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        buyer:user_profiles!buyer_id(full_name, phone),
        seller:user_profiles!seller_id(full_name, phone),
        listing:listings(product_name, quantity, unit)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: [], error };
  }
}

export async function getEscrowPayments() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:user_profiles!buyer_id(full_name, phone),
        seller:user_profiles!seller_id(full_name, phone),
        listing:listings(product_name, quantity, unit)
      `)
      .in('status', ['pending', 'in_escrow', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching escrow payments:', error);
    return { data: [], error };
  }
}

export async function releaseFunds(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        escrow_released_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error releasing funds:', error);
    return { success: false, error };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function processTimeSeriesData(data: any[], period: 'weekly' | 'monthly' | 'yearly') {
  const result: any[] = [];

  if (period === 'weekly') {
    // Group by day of week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = new Array(7).fill(0);

    data.forEach(item => {
      const date = new Date(item.created_at);
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      counts[dayIndex]++;
    });

    return days.map((label, index) => ({ id: `day-${index}`, label, volume: counts[index] }));
  } else if (period === 'monthly') {
    // Group by week
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const counts = new Array(4).fill(0);

    data.forEach(item => {
      const date = new Date(item.created_at);
      const weekIndex = Math.floor((date.getDate() - 1) / 7);
      if (weekIndex < 4) counts[weekIndex]++;
    });

    return weeks.map((label, index) => ({ id: `week-${index}`, label, volume: counts[index] }));
  } else {
    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    data.forEach(item => {
      const date = new Date(item.created_at);
      counts[date.getMonth()]++;
    });

    return months.map((label, index) => ({ id: `month-${index}`, label, volume: counts[index] }));
  }
}

function processUserGrowthData(data: any[], period: 'weekly' | 'monthly' | 'yearly') {
  const processedData = processTimeSeriesData(data, period);

  // Convert volume to cumulative users
  let cumulative = 0;
  return processedData.map(item => {
    cumulative += item.volume;
    return { id: item.id, label: item.label, users: cumulative };
  });
}
