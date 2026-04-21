import { Tractor, Smartphone, TrendingUp, Users, MapPin, ShoppingCart } from 'lucide-react';

const features = [
  {
    icon: Tractor,
    title: 'Equipment Rental',
    description: 'Access modern farming equipment and machinery on rent at affordable prices. From tractors to harvesters.'
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Easy-to-use mobile application designed for farmers. Check prices, book equipment, and connect anytime.'
  },
  {
    icon: TrendingUp,
    title: 'Market Prices',
    description: 'Real-time market prices for crops and produce. Make informed decisions about when and where to sell.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with other farmers, share experiences, and learn best practices from your farming community.'
  },
  {
    icon: MapPin,
    title: 'Local Services',
    description: 'Find agricultural services near you. Connect with local dealers, experts, and service providers.'
  },
  {
    icon: ShoppingCart,
    title: 'Direct Market Access',
    description: 'Sell your produce directly to buyers. Cut out middlemen and get better prices for your harvest.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Our </span>
            <span className="text-[#64b900]">Features</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Everything you need to modernize your farming operations and increase productivity
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#fefaf0] p-8 rounded-2xl hover:shadow-xl transition-shadow border border-[#64b900]/20"
            >
              <div className="bg-[#64b900] w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {feature.title}
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}