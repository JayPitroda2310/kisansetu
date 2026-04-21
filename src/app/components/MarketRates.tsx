import { TrendingUp, TrendingDown } from 'lucide-react';

const marketData = [
  {
    commodity: 'Wheat',
    price: '₹2,150',
    unit: 'per quintal',
    change: '+2.5%',
    trending: 'up',
    market: 'Delhi'
  },
  {
    commodity: 'Rice (Basmati)',
    price: '₹3,800',
    unit: 'per quintal',
    change: '+1.8%',
    trending: 'up',
    market: 'Punjab'
  },
  {
    commodity: 'Cotton',
    price: '₹6,500',
    unit: 'per quintal',
    change: '-0.5%',
    trending: 'down',
    market: 'Gujarat'
  },
  {
    commodity: 'Sugarcane',
    price: '₹340',
    unit: 'per quintal',
    change: '+3.2%',
    trending: 'up',
    market: 'UP'
  },
  {
    commodity: 'Soybean',
    price: '₹4,200',
    unit: 'per quintal',
    change: '+4.1%',
    trending: 'up',
    market: 'MP'
  },
  {
    commodity: 'Maize',
    price: '₹1,850',
    unit: 'per quintal',
    change: '-1.2%',
    trending: 'down',
    market: 'Karnataka'
  },
  {
    commodity: 'Potato',
    price: '₹1,200',
    unit: 'per quintal',
    change: '+5.3%',
    trending: 'up',
    market: 'UP'
  },
  {
    commodity: 'Tomato',
    price: '₹2,800',
    unit: 'per quintal',
    change: '+8.7%',
    trending: 'up',
    market: 'Maharashtra'
  }
];

export function MarketRates() {
  return (
    <section id="market-rates" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Market </span>
            <span className="text-[#64b900]">Rates</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Stay updated with real-time commodity prices across major markets
          </p>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/50 mt-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Last updated: Today, 10:00 AM
          </p>
        </div>

        {/* Market Rates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketData.map((item, index) => (
            <div 
              key={index}
              className="bg-[#fefaf0] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-[#64b900]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {item.commodity}
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {item.market}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${item.trending === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {item.trending === 'up' ? (
                    <TrendingUp className={`w-4 h-4 ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                  <span className={`font-['Geologica:Regular',sans-serif] text-xs ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {item.change}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-['Geologica:Regular',sans-serif] text-3xl text-[#64b900] mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {item.price}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <button className="bg-[#64b900] text-white px-8 py-3 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-lg" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            View All Market Rates
          </button>
        </div>
      </div>
    </section>
  );
}