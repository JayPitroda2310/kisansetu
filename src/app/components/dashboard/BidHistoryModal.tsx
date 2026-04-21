import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, Award } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { getListingBids } from '../../utils/supabase/bids';

interface BidHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  productName: string;
}

interface BidHistoryItem {
  id: string;
  bidder: string;
  amount: number;
  timeAgo: string;
  timestamp: string;
  status: 'leading' | 'outbid';
  isCurrentUser: boolean;
}

export function BidHistoryModal({ isOpen, onClose, listingId, productName }: BidHistoryModalProps) {
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBids, setTotalBids] = useState(0);

  useEffect(() => {
    if (!isOpen || !listingId) return;

    const fetchFullBidHistory = async () => {
      try {
        setLoading(true);

        // Get all bids for this listing
        const bids = await getListingBids(listingId);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Transform bids to bid history format
        const transformedBids: BidHistoryItem[] = bids.map((bid: any, index: number) => {
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

          // Format timestamp
          const timestamp = bidTime.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          return {
            id: bid.id,
            bidder: bidderName,
            amount: bid.amount,
            timeAgo,
            timestamp,
            status: index === 0 ? 'leading' : 'outbid',
            isCurrentUser: isCurrentUser || false
          };
        });

        setBidHistory(transformedBids);
        setTotalBids(transformedBids.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bid history:', error);
        setLoading(false);
      }
    };

    fetchFullBidHistory();
  }, [isOpen, listingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#64b900] to-[#549900] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-['Fraunces',serif] font-bold">Complete Bid History</h2>
            <p className="text-sm text-white/90 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#64b900]" />
              <div>
                <p className="text-xs text-gray-500">Total Bids</p>
                <p className="text-lg font-bold text-gray-900">{totalBids}</p>
              </div>
            </div>
            {bidHistory.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Highest Bid</p>
                    <p className="text-lg font-bold text-gray-900">₹{bidHistory[0].amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Latest Activity</p>
                    <p className="text-lg font-bold text-gray-900">{bidHistory[0].timeAgo}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bid History List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#64b900] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading bid history...</p>
            </div>
          ) : bidHistory.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bids placed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bidHistory.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`relative border rounded-lg p-4 transition-all ${
                    bid.isCurrentUser
                      ? 'border-[#64b900] bg-[#64b900]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${bid.status === 'leading' ? 'ring-2 ring-[#64b900]/30' : ''}`}
                >
                  {/* Leading Badge */}
                  {bid.status === 'leading' && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Leading
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      {/* Bidder Info */}
                      <div>
                        <p className="font-semibold text-gray-900 font-['Geologica:Regular',sans-serif]">
                          {bid.bidder}
                          {bid.isCurrentUser && (
                            <span className="ml-2 text-xs bg-[#64b900] text-white px-2 py-0.5 rounded-full">
                              Your Bid
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{bid.timestamp}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{bid.timeAgo}</p>
                      </div>
                    </div>

                    {/* Bid Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 font-['Fraunces',serif]">
                        ₹{bid.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">per kg</p>
                      {bid.status === 'outbid' && (
                        <span className="inline-block mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Outbid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold font-['Geologica:Regular',sans-serif] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
