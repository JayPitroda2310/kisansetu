import { useState } from 'react';
import { Search, Filter, MapPin, Star, ChevronDown, Timer, Eye, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ListingCard {
  id: string;
  image: string;
  cropName: string;
  variety: string;
  location: string;
  quantity: number;
  unit: string;
  saleType: 'Auction' | 'Fixed';
  currentBid: number;
  minPrice: number;
  rating: number;
  grade: string;
  orderType?: string;
}

export function MarketPage() {
  const [activePage, setActivePage] = useState(2);

  // Market ticker data - crop prices with trends
  const marketTicker = [
    { crop: 'Wheat', price: '₹2,150', change: '+2.5%', positive: true },
    { crop: 'Basmati Rice', price: '₹4,500', change: '+3.2%', positive: true },
    { crop: 'Cotton', price: '₹8,500', change: '-1.2%', positive: false },
    { crop: 'Sugarcane', price: '₹310', change: '+0.8%', positive: true },
    { crop: 'Soybean', price: '₹4,200', change: '+1.5%', positive: true },
    { crop: 'Maize', price: '₹1,850', change: '-0.5%', positive: false },
    { crop: 'Potato', price: '₹1,200', change: '+4.1%', positive: true },
    { crop: 'Onion', price: '₹2,800', change: '+2.8%', positive: true },
    { crop: 'Tomato', price: '₹3,200', change: '-2.3%', positive: false },
    { crop: 'Chickpea', price: '₹5,800', change: '+1.9%', positive: true },
  ];

  const listings: ListingCard[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Wheat',
      variety: 'HD-2967',
      location: 'Meerut, Uttar Pradesh',
      quantity: 100,
      unit: 'Quintal',
      saleType: 'Auction',
      currentBid: 2250,
      minPrice: 2000,
      rating: 4.7,
      grade: 'Whole Lot',
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1705147289789-6df2593f1b1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwYmFzbWF0aSUyMGdyYWluJTIwd2hpdGV8ZW58MXx8fHwxNzcyMDg3MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Rice',
      variety: 'Basmati 1121',
      location: 'Karnal, Haryana',
      quantity: 50,
      unit: 'Quintal',
      saleType: 'Fixed',
      currentBid: 4500,
      minPrice: 4000,
      rating: 4.6,
      grade: 'Partial Orders',
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1709963421370-98407fa9126e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG9lcyUyMGZyZXNoJTIwaGFydmVzdCUyMGdhcmRlbnxlbnwxfHx8fDE3NzIwODcxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Cotton',
      variety: 'Bt Cotton',
      location: 'Guntur, Andhra Pradesh',
      quantity: 75,
      unit: 'Quintal',
      saleType: 'Auction',
      currentBid: 5800,
      minPrice: 5000,
      rating: 4.8,
      grade: 'Whole Lot',
    },
  ];

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Search & Filters (Full Width) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search crops, inputs, equipment..." 
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#64b900] focus:ring-1 focus:ring-[#64b900] font-['Geologica:Regular',sans-serif]"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Crop Type', icon: Filter },
              { label: 'Price Range', icon: Filter },
              { label: 'Location', icon: MapPin },
              { label: 'Quantity', icon: Filter },
              { label: 'Sale Type', icon: Filter },
              { label: 'Time Left', icon: Filter },
            ].map((filter, idx) => (
              <button 
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-[#64b900] hover:bg-gray-50 text-sm font-['Geologica:Regular',sans-serif] text-gray-700 bg-white transition-colors"
              >
                {filter.label}
                {filter.label === 'Location' && <ChevronDown className="w-3 h-3 text-gray-400" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-['Geologica:Regular',sans-serif] bg-white cursor-pointer ml-auto">
            <span className="text-gray-500">Sort by:</span>
            <span className="font-semibold text-gray-900">Ending Soon</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Market Insights (Horizontal - Refined) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm w-full">
        <h2 className="font-['Fraunces',sans-serif] text-2xl font-semibold text-gray-900 mb-4">Market Insights</h2>
        
        <div className="flex flex-wrap gap-x-12 gap-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#64b900]/10 shrink-0">
              <div className="w-2.5 h-2.5 bg-[#64b900] rounded-full" />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-medium tracking-wider font-['Geologica:Regular',sans-serif] mb-0.5">Live Auctions Count</p>
              <p className="text-xl font-bold text-gray-900 font-['Geologica:Regular',sans-serif]">87</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#64b900]/10 shrink-0">
              <div className="w-2.5 h-2.5 bg-[#64b900] rounded-full" />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase font-medium tracking-wider font-['Geologica:Regular',sans-serif] mb-0.5">Top Traded Crop</p>
              <p className="text-xl font-bold text-gray-900 font-['Geologica:Regular',sans-serif]">Basmati Rice</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-5" />

        {/* Live Market Rates Ticker */}
        <div>
          <h3 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-4">Live Market Rates</h3>
          <div className="relative overflow-hidden -mx-5 px-5">
            {/* Ticker Container */}
            <div className="flex ticker-scroll py-2">
              {/* First set of items */}
              {marketTicker.map((item, idx) => (
                <div key={`ticker-1-${idx}`} className="flex items-center gap-3 px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 text-sm whitespace-nowrap">
                      {item.crop}
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 text-sm">
                      {item.price}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${item.positive ? 'bg-green-50' : 'bg-red-50'}`}>
                    {item.positive ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {marketTicker.map((item, idx) => (
                <div key={`ticker-2-${idx}`} className="flex items-center gap-3 px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 text-sm whitespace-nowrap">
                      {item.crop}
                    </span>
                    <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 text-sm">
                      {item.price}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${item.positive ? 'bg-green-50' : 'bg-red-50'}`}>
                    {item.positive ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Gradient overlays for fade effect - Enhanced */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-scroll {
          animation: ticker-scroll 40s linear infinite;
        }
        
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Live Listings (Vertical Cards) */}
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-6 font-semibold">Live Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              {/* Image */}
              <div className="h-48 overflow-hidden">
                <ImageWithFallback src={listing.image} alt={listing.cropName} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                {/* Crop Name */}
                <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-lg text-gray-900">{listing.cropName} - {listing.variety}</h3>
                
                {/* Order Type Badge */}
                <div>
                  <span className="inline-block px-3 py-1 rounded-md text-xs font-['Geologica:Regular',sans-serif] bg-[#64b900]/10 text-[#64b900] font-medium">
                    {listing.grade}
                  </span>
                </div>

                {/* Quantity */}
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Quantity:</span>
                  <span className="font-['Geologica:Regular',sans-serif] font-semibold text-sm text-gray-900">{listing.quantity} {listing.unit}</span>
                </div>

                {/* Sale Type */}
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Sale Type:</span>
                  <span className="px-3 py-1 rounded-md text-xs font-['Geologica:Regular',sans-serif] font-medium bg-[#64b900]/10 text-[#64b900]">
                    {listing.saleType === 'Auction' ? 'Auction' : 'Fixed Price'}
                  </span>
                </div>

                {/* Total Price */}
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Total Price:</span>
                  <span className="text-2xl font-semibold text-[#64b900] font-['Geologica:Regular',sans-serif]">₹{(listing.currentBid * listing.quantity).toLocaleString()}</span>
                </div>

                {/* Per Unit Price */}
                <div className="flex justify-between items-center">
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">Per {listing.unit}:</span>
                  <span className="font-['Geologica:Regular',sans-serif] text-xs text-gray-700">₹{listing.currentBid.toLocaleString()}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="font-['Geologica:Regular',sans-serif]">{listing.location}</span>
                </div>

                {/* MOQ for partial orders (only for Rice - id 2) */}
                {listing.id === '2' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs font-['Geologica:Regular',sans-serif] text-gray-700">
                    MOQ: 10 {listing.unit}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 mt-auto">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]">Previous</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#64b900] text-white text-sm font-medium shadow-sm font-['Geologica:Regular',sans-serif]">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]">...</button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]">Next</button>
        </div>
      </div>
    </div>
  );
}