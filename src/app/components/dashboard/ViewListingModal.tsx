import { X, Clock, MessageSquare, Check, User, Building, Calendar, Package, IndianRupee } from 'lucide-react';

interface Bid {
  id: string;
  bidderName: string;
  bidderCompany: string;
  amount: number;
  time: string;
  isLeading: boolean;
}

interface SaleDetails {
  buyerName: string;
  buyerCompany: string;
  buyerContact: string;
  finalAmount: number;
  soldDate: string;
  paymentStatus: 'completed' | 'pending' | 'in-escrow';
  deliveryStatus: 'pending' | 'in-transit' | 'delivered';
}

interface ViewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    cropName: string;
    variety: string;
    quantity: number;
    unit: string;
    listedDate: string;
    listingNumber: string;
    status: 'active' | 'sold' | 'expired';
    timeRemaining: {
      days: number;
      hours: number;
      minutes: number;
    };
  };
  onAcceptBid: (bid: Bid) => void;
  acceptedBidIds?: string[];
  onNavigate?: (view: string) => void;
}

export function ViewListingModal({ isOpen, onClose, listing, onAcceptBid, acceptedBidIds, onNavigate }: ViewListingModalProps) {
  if (!isOpen) return null;

  // Mock sale details for sold listings
  const saleDetails: SaleDetails = {
    buyerName: 'Rajesh Kumar',
    buyerCompany: 'Agrawal Traders',
    buyerContact: '+91 98765 43210',
    finalAmount: 195000,
    soldDate: '2024-02-15',
    paymentStatus: 'completed',
    deliveryStatus: 'delivered'
  };

  const bids: Bid[] = [
    {
      id: 'B001',
      bidderName: 'Ramesh',
      bidderCompany: 'Ramesh Trading Co.',
      amount: 230000,
      time: '2 hours ago',
      isLeading: true,
    },
    {
      id: 'B002',
      bidderName: 'Kumar',
      bidderCompany: 'Kumar Agro',
      amount: 228000,
      time: '3 hours ago',
      isLeading: false,
    },
    {
      id: 'B003',
      bidderName: 'Punjab',
      bidderCompany: 'Punjab Exports',
      amount: 226000,
      time: '5 hours ago',
      isLeading: false,
    },
  ];

  const handleAcceptClick = (bid: Bid) => {
    console.log('ACCEPT CLICKED!!!', bid);
    alert('ACCEPT BUTTON WORKS! Bid: ' + bid.bidderCompany);
    onAcceptBid(bid);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-escrow':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900">
              {listing.cropName} - {listing.variety}
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mt-1">
              Posted on {new Date(listing.listedDate).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })} • Listing #{listing.listingNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium font-['Geologica:Regular',sans-serif] capitalize ${
              listing.status === 'sold' ? 'bg-blue-100 text-blue-700' : 
              listing.status === 'active' ? 'bg-green-100 text-green-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {listing.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conditional Content Based on Status */}
        {listing.status === 'sold' ? (
          /* Sale Details for Sold Listings */
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-['Fraunces',sans-serif] text-2xl text-gray-900">
                    Sale Completed
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    This listing has been successfully sold
                  </p>
                </div>
              </div>
            </div>

            {/* Sale Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer Details Card */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-['Fraunces',sans-serif] text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#64b900]" />
                  Buyer Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Buyer Name
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900">
                      {saleDetails.buyerName}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Company
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-base font-medium text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      {saleDetails.buyerCompany}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Contact
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-base font-medium text-gray-900">
                      {saleDetails.buyerContact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details Card */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-['Fraunces',sans-serif] text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#64b900]" />
                  Transaction Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Final Sale Amount
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-[#64b900]">
                      ₹{saleDetails.finalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Quantity Sold
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-base font-medium text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                      Sale Date
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-base font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(saleDetails.soldDate).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Sold Listings */}
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {
                  onNavigate?.('messages');
                  onClose();
                }}
                className="flex-1 px-6 py-3 border-2 border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900]/5 transition-colors font-['Geologica:SemiBold',sans-serif] text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Buyer
              </button>
              <button className="flex-1 px-6 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                View Order Details
              </button>
            </div>
          </div>
        ) : (
          /* Active Listing - Show Bids */
          <>
            {/* Auction Timer Section */}
            <div className="bg-[#FFF8E7] border-y border-[#FFE5A0] px-6 py-6 flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-[#FFA500]" />
              <div className="text-center">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-[#CC8400] font-medium mb-1">
                  AUCTION ENDS IN
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-3xl font-bold text-[#FFA500]">
                  {listing.timeRemaining.days}d {listing.timeRemaining.hours}h {listing.timeRemaining.minutes}m
                </p>
              </div>
            </div>

            {/* Bids List */}
            <div className="p-6 space-y-4">
              <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 mb-4">
                Received Bids
              </h3>
              
              {bids.map((bid) => {
                const isAccepted = acceptedBidIds?.includes(bid.id);
                
                return (
                  <div
                    key={bid.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#64b900]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      {/* Bidder Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900">
                            {bid.bidderCompany}
                          </h4>
                          {bid.isLeading && (
                            <span className="px-3 py-1 rounded-md text-xs font-medium font-['Geologica:Regular',sans-serif] bg-[#64b900]/10 text-[#64b900]">
                              Leading Bid
                            </span>
                          )}
                        </div>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-500">
                          {bid.time}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right mx-8">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mb-1">
                          Bid Amount
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-[#64b900]">
                          ₹{bid.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {isAccepted ? (
                          <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Accepted
                          </div>
                        ) : (
                          <button
                            onMouseDown={() => handleAcceptClick(bid)}
                            className="px-6 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                          >
                            <Check className="w-5 h-5" />
                            Accept Bid
                          </button>
                        )}
                        <button className="px-6 py-3 border-2 border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900]/5 transition-colors font-['Geologica:SemiBold',sans-serif] text-sm flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <button className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium">
            View Public Preview
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}