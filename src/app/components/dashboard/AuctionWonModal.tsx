import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Package, Calendar, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AuctionWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment?: () => void;
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
    endsIn: number;
  };
  winningBid: number;
}

interface BidActivity {
  bidder: string;
  amount: number;
  timeAgo: string;
  status: 'leading' | 'outbid';
}

export function AuctionWonModal({ isOpen, onClose, onProceedToPayment, product, auction, winningBid }: AuctionWonModalProps) {
  const [timeLeft, setTimeLeft] = useState(auction.endsIn);
  const [escrowDeadline, setEscrowDeadline] = useState(86400); // 24 hours in seconds

  // Mock bid activity data
  const bidActivity: BidActivity[] = [
    { bidder: 'B#127', amount: winningBid, timeAgo: '2 mins ago', status: 'leading' },
    { bidder: 'B#103', amount: winningBid - 1, timeAgo: '5 mins ago', status: 'outbid' },
    { bidder: 'B#089', amount: winningBid - 2, timeAgo: '12 mins ago', status: 'outbid' },
    { bidder: 'B#127', amount: winningBid - 3, timeAgo: '18 mins ago', status: 'outbid' },
    { bidder: 'B#056', amount: winningBid - 4, timeAgo: '25 mins ago', status: 'outbid' },
  ];

  // Countdown timer for auction
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Countdown timer for escrow deadline
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setEscrowDeadline((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalWinningAmount = winningBid * parseInt(product.quantity);

  const handleProceedToPayment = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation();
    }
    console.log('Proceed to Payment clicked');
    if (onProceedToPayment) {
      onProceedToPayment();
    } else {
      // Default behavior - show alert for demo
      alert('Redirecting to escrow payment gateway...\n\nIn production, this would take you to a secure payment page to complete your transaction.');
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Prevent closing by clicking overlay
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4"
      onClick={handleOverlayClick}
      onWheel={(e) => {
        // Prevent wheel events on overlay from propagating, but allow them on modal content
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="bg-white border-b-2 border-black/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
              Live Auction
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Whole Lot Auction Mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        {/* Congratulations Banner */}
        <div className="bg-[#1a1a1a] px-6 py-4 flex items-center justify-center gap-2 flex-shrink-0">
          <span className="text-2xl">🏆</span>
          <p className="font-['Geologica:Regular',sans-serif] text-white text-base" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Congratulations! You Won This Auction
          </p>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="overflow-y-auto flex-1 p-6"
          onWheel={(e) => e.stopPropagation()}
          style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Product Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border-2 border-black/10 rounded-lg p-5">
                <div className="flex gap-6">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#64b900]/10 px-3 py-1 rounded-full">
                        <span className="text-black text-sm">★</span>
                        <span className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Variety
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.variety}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Grade
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.grade}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Total Quantity
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Location
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] flex items-center gap-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          <MapPin className="w-3 h-3" />
                          {product.location}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Packaging
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.packaging}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Storage
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.storage}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Harvest Date
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {product.harvestDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auction Information */}
              <div className="bg-white border-2 border-black/10 rounded-lg p-5">
                <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                  Auction Information
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Base Price (per kg)
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-lg text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{auction.basePrice}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Minimum Bid Increment
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-lg text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{auction.minIncrement}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Total Lot Value (Base)
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-lg text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{auction.totalLotValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Current Highest Bid */}
                <div className="bg-gray-50 border-2 border-black/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Current Highest Bid (per kg)
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-3xl text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        ₹{winningBid}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Total: <span className="font-semibold">₹{totalWinningAmount.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-8 h-8 text-[#64b900]" />
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="text-center">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Auction Ends In
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg">
                    <Clock className="w-5 h-5" />
                    <span className="font-['Geologica:Regular',sans-serif] text-2xl font-mono" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900] mt-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    If a bid is placed in the last 2 minutes, the auction extends automatically.
                  </p>
                </div>
              </div>

              {/* Bid Activity */}
              <div className="bg-white border-2 border-black/10 rounded-lg p-5">
                <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                  Bid Activity
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-black/10">
                        <th className="text-left font-['Geologica:Regular',sans-serif] text-sm text-black/70 pb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Bidder
                        </th>
                        <th className="text-left font-['Geologica:Regular',sans-serif] text-sm text-black/70 pb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Bid Amount (per kg)
                        </th>
                        <th className="text-left font-['Geologica:Regular',sans-serif] text-sm text-black/70 pb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Time Placed
                        </th>
                        <th className="text-left font-['Geologica:Regular',sans-serif] text-sm text-black/70 pb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {bidActivity.map((bid, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {bid.bidder}
                          </td>
                          <td className="py-3 font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            ₹{bid.amount}
                          </td>
                          <td className="py-3 font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {bid.timeAgo}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full font-['Geologica:Regular',sans-serif] text-xs ${
                                bid.status === 'leading'
                                  ? 'bg-[#1a1a1a] text-white'
                                  : 'bg-gray-100 text-black/60 border border-black/10'
                              }`}
                              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                            >
                              {bid.status === 'leading' ? 'Leading' : 'Outbid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="w-full mt-4 font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] hover:underline" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  View Full History
                </button>
              </div>
            </div>

            {/* Right Column - Congratulations Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-[#64b900] rounded-lg p-5 sticky top-6">
                {/* Trophy and Title */}
                <div className="text-center mb-5">
                  <div className="text-6xl mb-3">🏆</div>
                  <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-2">
                    Congratulations!
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    You won this auction
                  </p>
                </div>

                {/* Winning Bid */}
                <div className="mb-5">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/50 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Your Winning Bid
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-3xl text-black mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    ₹{totalWinningAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    ₹{winningBid} per kg
                  </p>
                </div>

                {/* Escrow Payment Deadline */}
                <div className="bg-[#64b900]/5 border border-[#64b900]/20 rounded-lg p-4 mb-5">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Escrow Payment Deadline
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-black" />
                    <span className="font-['Geologica:Regular',sans-serif] text-2xl text-black font-mono" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {formatTime(escrowDeadline)}
                    </span>
                  </div>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Complete payment within 24 hours
                  </p>
                </div>

                {/* Proceed to Escrow Payment Button */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#1a1a1a] text-white px-6 py-4 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-black transition-colors mb-4"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Proceed to Escrow Payment
                </button>

                {/* Escrow Protected Transaction */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="w-4 h-4 text-[#64b900] border-black/20 rounded"
                  />
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Escrow Protected Transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}