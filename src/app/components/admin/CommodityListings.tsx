import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle, X, Ban, Clock, RefreshCw } from 'lucide-react';
import { getAllListings, updateListingStatus } from '../../utils/supabase/admin';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export function CommodityListings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  // Debug function to check database directly
  const checkDatabaseDirectly = async () => {
    const { data, error, count } = await supabase
      .from('listings')
      .select('*', { count: 'exact' });

    console.log('🔍 Direct Database Check:');
    console.log('Total listings in DB:', count);
    console.log('Listings data:', data);
    console.log('Error (if any):', error);

    if (data && data.length > 0) {
      toast.success(`Found ${data.length} listings in database`, {
        description: 'Check console for details'
      });
    } else {
      toast.warning('No listings found in database', {
        description: error ? 'There was an error - check console' : 'Database is empty'
      });
    }
  };

  const loadListings = useCallback(async () => {
    setLoading(true);
    console.log('🔍 Loading listings with filter:', filterStatus);

    const { data, error } = await getAllListings({
      status: filterStatus
    });

    if (error) {
      toast.error('Failed to load listings', {
        description: 'Check browser console for details. You may need to run the RLS fix.'
      });
      console.error('❌ Error loading listings:', error);
    } else if (!data || data.length === 0) {
      console.log('⚠️ No listings found with current filter:', filterStatus);
      toast.info(`No ${filterStatus === 'all' ? '' : filterStatus} listings found`, {
        description: 'Try changing the filter or creating a new listing.'
      });
      setListings([]);
    } else {
      console.log('✅ Listings loaded:', data.length, 'found');
      console.log('📦 First listing:', data[0]);
      setListings(data);
    }
    setLoading(false);
  }, [filterStatus]);

  // Load listings when filter changes
  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Real-time subscription for new listings
  useEffect(() => {
    const channel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('Listing change detected:', payload);

          // Show notification for new listings
          if (payload.eventType === 'INSERT') {
            toast.info('New listing added to marketplace', {
              description: 'The listings table has been updated.'
            });
          }

          // Reload listings when any change occurs
          loadListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadListings]);

  // Debounced search effect
  useEffect(() => {
    // Small delay for search optimization
    const timer = setTimeout(() => {
      // Search is handled on client side in the filter below
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter on client side for search
  const filteredListings = listings.filter(listing => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      listing.product_name?.toLowerCase().includes(term) ||
      listing.id?.toLowerCase().includes(term) ||
      listing.seller?.full_name?.toLowerCase().includes(term)
    );
  });

  const handleSuspend = async (listingId: string) => {
    const { success, error } = await updateListingStatus(listingId, 'cancelled');
    if (success) {
      toast.success('Listing suspended successfully');

      // Update state immediately
      setListings(listings.map(listing =>
        listing.id === listingId ? { ...listing, status: 'cancelled' } : listing
      ));

      // Update selected listing if it's open
      if (selectedListing && selectedListing.id === listingId) {
        setSelectedListing({ ...selectedListing, status: 'cancelled' });
      }
    } else {
      toast.error('Failed to suspend listing');
      console.error(error);
    }
  };

  const handleActivate = async (listingId: string) => {
    const { success, error } = await updateListingStatus(listingId, 'active');
    if (success) {
      toast.success('Listing activated successfully');

      // Update state immediately
      setListings(listings.map(listing =>
        listing.id === listingId ? { ...listing, status: 'active' } : listing
      ));

      // Update selected listing if it's open
      if (selectedListing && selectedListing.id === listingId) {
        setSelectedListing({ ...selectedListing, status: 'active' });
      }
    } else {
      toast.error('Failed to activate listing');
      console.error(error);
    }
  };

  // Load bid history for a listing
  const loadBidHistory = async (listingId: string) => {
    setLoadingBids(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          bidder:user_profiles!bidder_id(full_name)
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBidHistory(data || []);
    } catch (error) {
      console.error('Error loading bid history:', error);
      setBidHistory([]);
    }
    setLoadingBids(false);
  };

  // Load bids when listing is selected
  useEffect(() => {
    if (selectedListing) {
      loadBidHistory(selectedListing.id);
    } else {
      setBidHistory([]);
    }
  }, [selectedListing]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">
              Commodity Listings
            </h1>
            <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Moderate and manage marketplace listings
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Total Listings
            </p>
            <p className="font-['Fraunces',sans-serif] text-2xl text-black">
              {filteredListings.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              placeholder="Search by commodity, listing ID, or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => loadListings()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 hover:border-[#64b900] hover:bg-[#64b900]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh listings"
          >
            <RefreshCw className={`w-5 h-5 text-black/60 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={checkDatabaseDirectly}
            className="px-4 py-2.5 rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors font-['Geologica:Regular',sans-serif] text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            title="Debug: Check database directly"
          >
            🔍 Debug
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Listing ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Commodity</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Farmer</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Quantity</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Starting Price</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Highest Bid</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Posted Date</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading listings...</p>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No listings found
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => {
                  const startPrice = listing.purchase_type === 'auction' ? listing.starting_bid : listing.fixed_price;
                  const currentBid = listing.current_bid || startPrice;

                  return (
                    <tr key={listing.id} className="hover:bg-[#64b900]/5 transition-colors">
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{listing.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{listing.product_name}</td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{listing.seller?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{listing.quantity} {listing.unit}</td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>₹{startPrice?.toLocaleString('en-IN') || '0'}</td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {listing.purchase_type === 'auction' ? `₹${currentBid?.toLocaleString('en-IN') || '0'}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] ${
                          listing.status === 'active' ? 'bg-green-100 text-green-700' :
                          listing.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          listing.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                          listing.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedListing(listing)}
                            className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors"
                            title="View Listing"
                          >
                            <Eye className="w-4 h-4 text-black/60" />
                          </button>
                          {listing.status === 'draft' && (
                            <button
                              onClick={() => handleActivate(listing.id)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve Listing"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {listing.status === 'active' ? (
                            <button
                              onClick={() => handleSuspend(listing.id)}
                              className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Suspend Listing"
                            >
                              <Ban className="w-4 h-4 text-orange-600" />
                            </button>
                          ) : (listing.status === 'cancelled' || listing.status === 'draft') && (
                            <button
                              onClick={() => handleActivate(listing.id)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Activate Listing"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedListing(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '1rem' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">
                  {selectedListing.product_name} - {selectedListing.quantity} {selectedListing.unit}
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Listing ID: {selectedListing.id.substring(0, 8)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* Seller Details */}
              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Name:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedListing.seller?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedListing.seller?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Phone:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedListing.seller?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Listing Description */}
              <div>
                <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Description</h3>
                <p className="font-['Geologica:Regular',sans-serif] text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedListing.description || `High-quality ${selectedListing.product_name?.toLowerCase()} harvested this season. Stored in optimal conditions.`}
                </p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Category</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedListing.category || 'N/A'}</p>
                </div>
                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Purchase Type</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedListing.purchase_type === 'auction' ? 'Auction' : 'Fixed Price'}
                  </p>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedListing.purchase_type === 'auction' ? 'Starting Bid' : 'Fixed Price'}
                  </p>
                  <p className="font-['Fraunces',sans-serif] text-2xl text-black">
                    ₹{(selectedListing.purchase_type === 'auction' ? selectedListing.starting_bid : selectedListing.fixed_price)?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                {selectedListing.purchase_type === 'auction' && (
                  <div className="bg-[#64b900]/5 rounded-xl p-4">
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Current Bid</p>
                    <p className="font-['Fraunces',sans-serif] text-2xl text-[#64b900]">
                      ₹{(selectedListing.current_bid || selectedListing.starting_bid)?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                )}
                {selectedListing.purchase_type !== 'auction' && (
                  <div className="bg-[#64b900]/5 rounded-xl p-4">
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</p>
                    <p className="font-['Geologica:Regular',sans-serif] text-lg text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {selectedListing.status?.charAt(0).toUpperCase() + selectedListing.status?.slice(1)}
                    </p>
                  </div>
                )}
              </div>

              {/* Bid History - Only show for auctions */}
              {selectedListing.purchase_type === 'auction' && (
                <div>
                  <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Bid History</h3>
                  {loadingBids ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-3 border-[#64b900] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : bidHistory.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bidHistory.map((bid) => {
                        const timeAgo = getTimeAgo(new Date(bid.created_at));
                        return (
                          <div key={bid.id} className="flex items-center justify-between p-3 bg-black/5 rounded-lg">
                            <div>
                              <p className="font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                {bid.bidder?.full_name || 'Anonymous'}
                              </p>
                              <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{timeAgo}</p>
                            </div>
                            <p className="font-['Geologica:Regular',sans-serif] font-medium text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              ₹{bid.bid_amount?.toLocaleString('en-IN') || '0'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-['Geologica:Regular',sans-serif] text-black/60 text-center py-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      No bids yet
                    </p>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex gap-3">
                {selectedListing.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleSuspend(selectedListing.id);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Suspend Listing
                  </button>
                ) : selectedListing.status === 'cancelled' || selectedListing.status === 'draft' ? (
                  <button
                    onClick={() => {
                      handleActivate(selectedListing.id);
                    }}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Activate Listing
                  </button>
                ) : null}
                <button
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}