import { Tractor, Smartphone, TrendingUp, Users, MapPin, ShoppingCart, Leaf, MessageCircle, CreditCard, Shield, BarChart3, Award } from 'lucide-react';

const mainFeatures = [
  {
    icon: Tractor,
    title: 'Equipment Rental',
    description: 'Access modern farming equipment and machinery on rent at affordable prices. From tractors to harvesters.',
    details: 'Browse through a wide selection of farming equipment, check availability in real-time, and book machinery with just a few clicks. Our platform ensures verified equipment owners and transparent pricing.'
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Easy-to-use mobile application designed for farmers. Check prices, book equipment, and connect anytime.',
    details: 'Available on Android and iOS, our mobile app brings all platform features to your fingertips. Work offline and sync when connected.'
  },
  {
    icon: TrendingUp,
    title: 'Market Prices',
    description: 'Real-time market prices for crops and produce. Make informed decisions about when and where to sell.',
    details: 'Get up-to-date mandi prices from across India. Track price trends, set alerts, and plan your selling strategy for maximum profit.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with other farmers, share experiences, and learn best practices from your farming community.',
    details: 'Join discussion forums, participate in Q&A sessions with agricultural experts, and build relationships with fellow farmers.'
  },
  {
    icon: MapPin,
    title: 'Local Services',
    description: 'Find agricultural services near you. Connect with local dealers, experts, and service providers.',
    details: 'Discover verified service providers in your area including soil testing labs, veterinary services, and agricultural consultants.'
  },
  {
    icon: ShoppingCart,
    title: 'Direct Market Access',
    description: 'Sell your produce directly to buyers. Cut out middlemen and get better prices for your harvest.',
    details: 'Create listings for your produce, negotiate directly with buyers, and use our secure escrow system for safe transactions.'
  }
];

const additionalFeatures = [
  {
    icon: Leaf,
    title: 'Weather Forecasts',
    description: 'Get accurate weather predictions and farming advisories to plan your agricultural activities better.'
  },
  {
    icon: MessageCircle,
    title: 'Expert Consultation',
    description: 'Connect with agricultural experts for advice on crop management, pest control, and farming techniques.'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Multiple payment options with escrow protection ensuring safe and transparent transactions.'
  },
  {
    icon: Shield,
    title: 'Verified Users',
    description: 'All users undergo verification to ensure a trustworthy and secure marketplace environment.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your farming business with detailed analytics, reports, and insights on sales and expenses.'
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Quality checks and ratings system to ensure the best standards in produce and services.'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Our </span>
            <span className="text-[#64b900]">Features</span>
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-3xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Discover all the powerful tools and features that make KisanSetu the most comprehensive farming platform in India
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fefaf0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Fraunces',sans-serif] text-4xl text-center mb-16">
            <span className="text-black">Core </span>
            <span className="text-[#64b900]">Features</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-[#fefaf0] p-8 rounded-2xl border-2 border-[#64b900]/20 hover:border-[#64b900] hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-[#64b900] w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Geologica:Regular',sans-serif] text-2xl mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {feature.title}
                    </h3>
                    <p className="font-['Geologica:Regular',sans-serif] text-black/70 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {feature.description}
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {feature.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fefaf0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Fraunces',sans-serif] text-4xl text-center mb-16">
            <span className="text-black">Additional </span>
            <span className="text-[#64b900]">Benefits</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="bg-[#fd0] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#64b900]" />
                </div>
                <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {feature.title}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-black/70 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}