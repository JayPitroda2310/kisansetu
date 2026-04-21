import { TrendingUp, TrendingDown, Search, Filter, MapPin, Calendar, Info } from 'lucide-react';
import { useState } from 'react';

const marketData = [
  {
    commodity: 'Wheat',
    price: '₹2,150',
    unit: 'per quintal',
    change: '+2.5%',
    trending: 'up',
    market: 'Delhi',
    category: 'Grains'
  },
  {
    commodity: 'Rice (Basmati)',
    price: '₹3,800',
    unit: 'per quintal',
    change: '+1.8%',
    trending: 'up',
    market: 'Punjab',
    category: 'Grains'
  },
  {
    commodity: 'Cotton',
    price: '₹6,500',
    unit: 'per quintal',
    change: '-0.5%',
    trending: 'down',
    market: 'Gujarat',
    category: 'Cash Crops'
  },
  {
    commodity: 'Sugarcane',
    price: '₹340',
    unit: 'per quintal',
    change: '+3.2%',
    trending: 'up',
    market: 'UP',
    category: 'Cash Crops'
  },
  {
    commodity: 'Soybean',
    price: '₹4,200',
    unit: 'per quintal',
    change: '+4.1%',
    trending: 'up',
    market: 'MP',
    category: 'Oilseeds'
  },
  {
    commodity: 'Maize',
    price: '₹1,850',
    unit: 'per quintal',
    change: '-1.2%',
    trending: 'down',
    market: 'Karnataka',
    category: 'Grains'
  },
  {
    commodity: 'Potato',
    price: '₹1,200',
    unit: 'per quintal',
    change: '+5.3%',
    trending: 'up',
    market: 'UP',
    category: 'Vegetables'
  },
  {
    commodity: 'Tomato',
    price: '₹2,800',
    unit: 'per quintal',
    change: '+8.7%',
    trending: 'up',
    market: 'Maharashtra',
    category: 'Vegetables'
  },
  {
    commodity: 'Onion',
    price: '₹3,500',
    unit: 'per quintal',
    change: '+12.3%',
    trending: 'up',
    market: 'Maharashtra',
    category: 'Vegetables'
  },
  {
    commodity: 'Mustard',
    price: '₹5,200',
    unit: 'per quintal',
    change: '+2.1%',
    trending: 'up',
    market: 'Rajasthan',
    category: 'Oilseeds'
  },
  {
    commodity: 'Groundnut',
    price: '₹5,800',
    unit: 'per quintal',
    change: '-0.8%',
    trending: 'down',
    market: 'Gujarat',
    category: 'Oilseeds'
  },
  {
    commodity: 'Turmeric',
    price: '₹7,200',
    unit: 'per quintal',
    change: '+6.5%',
    trending: 'up',
    market: 'Tamil Nadu',
    category: 'Spices'
  }
];

const categories = ['All', 'Grains', 'Vegetables', 'Cash Crops', 'Oilseeds', 'Spices'];
const states = ['All States', 'Delhi', 'Punjab', 'Gujarat', 'UP', 'MP', 'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu'];

export default function MarketRatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = marketData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesState = selectedState === 'All States' || item.market === selectedState;
    const matchesSearch = item.commodity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesState && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Market </span>
            <span className="text-[#64b900]">Rates</span>
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-3xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Real-time commodity prices from major agricultural markets across India
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-black/60">
            <Calendar className="w-4 h-4" />
            <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Last updated: Today, 10:00 AM
            </span>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-[#fefaf0] border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search commodities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:ring-2 focus:ring-[#64b900] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:ring-2 focus:ring-[#64b900] focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:ring-2 focus:ring-[#64b900] focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Map + Rates */}
      <section className="bg-[#fefaf0]">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left Side: Interactive Map */}
          <div className="lg:w-1/2 bg-white border-r border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Map Header */}
              <div className="mb-4">
                <h2 className="font-['Fraunces',sans-serif] text-3xl mb-2">
                  <span className="text-black">Price </span>
                  <span className="text-[#64b900]">Distribution</span>
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 flex items-center gap-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <Info className="w-4 h-4" />
                  Interactive map showing commodity prices across India
                </p>
              </div>

              {/* Map Container - API Integration Placeholder */}
              <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for API Map */}
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-[#64b900] mx-auto mb-4" />
                  <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Interactive Map Integration
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-black/60 text-sm mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Dynamic choropleth map will be integrated here via API
                  </p>
                  <div className="bg-white rounded-lg p-4 inline-block border border-gray-200 shadow-sm">
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/80 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      <strong>API Endpoint:</strong> /api/market-map
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Map displays state-wise pricing data with color gradients
                    </p>
                  </div>
                </div>

                {/* Mock Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg border border-gray-200">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Price Range (₹/quintal)
                  </p>
                  <div className="flex gap-1">
                    {['bg-red-200', 'bg-yellow-200', 'bg-orange-300', 'bg-green-300', 'bg-teal-500'].map((color, i) => (
                      <div key={i} className={`w-8 h-4 ${color} rounded`}></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-['Geologica:Regular',sans-serif] text-xs text-black/60">Low</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-xs text-black/60">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Market Rates List */}
          <div className="lg:w-1/2 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">{filteredData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredData.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-[#64b900]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-['Geologica:Regular',sans-serif] text-lg mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {item.commodity}
                        </h3>
                        <div className="flex items-center gap-1 text-black/60">
                          <MapPin className="w-3 h-3" />
                          <p className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {item.market}
                          </p>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-[#fefaf0] text-xs rounded-full font-['Geologica:Regular',sans-serif] text-black/70">
                          {item.category}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${item.trending === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {item.trending === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-['Geologica:Regular',sans-serif] text-xs ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-2xl text-[#64b900] mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {item.price}
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {item.unit}
                        </p>
                      </div>
                      <button className="text-[#64b900] hover:bg-[#64b900] hover:text-white px-3 py-1 rounded-lg text-sm border border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-['Geologica:Regular',sans-serif] text-xl text-black/60">
                  No commodities found matching your filters
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-['Fraunces',sans-serif] text-3xl mb-4">
            <span className="text-black">About </span>
            <span className="text-[#64b900]">Market Rates</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-3xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            This section provides real-time commodity prices from major agricultural markets across India. The data is updated daily to ensure you have the most current information.
          </p>
        </div>
      </section>
    </div>
  );
}