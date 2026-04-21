import { UserRole } from './DashboardLayout';
import { 
  TrendingUp, 
  ShoppingBag, 
  Heart, 
  Package, 
  Gavel, 
  IndianRupee,
  Clock,
  Calendar,
  Tractor 
} from 'lucide-react';

interface DashboardContentProps {
  currentRole: UserRole;
  enabledRoles: UserRole[];
}

// Mock data for widgets
const buyerWidgets = [
  {
    id: 'active-bids',
    title: 'Active Bids',
    value: '5',
    icon: Gavel,
    color: 'bg-blue-500',
    trend: '+2 today'
  },
  {
    id: 'recent-purchases',
    title: 'Recent Purchases',
    value: '₹45,000',
    icon: ShoppingBag,
    color: 'bg-green-500',
    trend: 'Last 7 days'
  },
  {
    id: 'saved-crops',
    title: 'Saved Listings',
    value: '12',
    icon: Heart,
    color: 'bg-red-500',
    trend: '3 new'
  }
];

const sellerWidgets = [
  {
    id: 'active-listings',
    title: 'Active Listings',
    value: '8',
    icon: Package,
    color: 'bg-[#64b900]',
    trend: '2 pending approval'
  },
  {
    id: 'bids-received',
    title: 'Bids Received',
    value: '23',
    icon: Gavel,
    color: 'bg-purple-500',
    trend: '5 today'
  },
  {
    id: 'earnings',
    title: 'Total Earnings',
    value: '₹1,25,000',
    icon: IndianRupee,
    color: 'bg-yellow-500',
    trend: 'This month'
  }
];

const equipmentWidgets = [
  {
    id: 'equipment-status',
    title: 'Equipment Listed',
    value: '4',
    icon: Tractor,
    color: 'bg-orange-500',
    trend: 'All active'
  },
  {
    id: 'upcoming-bookings',
    title: 'Upcoming Bookings',
    value: '7',
    icon: Calendar,
    color: 'bg-cyan-500',
    trend: 'Next 2 weeks'
  },
  {
    id: 'rental-income',
    title: 'Rental Income',
    value: '₹35,000',
    icon: IndianRupee,
    color: 'bg-green-600',
    trend: 'This month'
  }
];

const serviceWidgets = [
  {
    id: 'active-routes',
    title: 'Active Routes',
    value: '3',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    trend: 'In progress'
  },
  {
    id: 'pending-requests',
    title: 'Pending Requests',
    value: '9',
    icon: Clock,
    color: 'bg-amber-500',
    trend: '4 urgent'
  },
  {
    id: 'service-earnings',
    title: 'Service Earnings',
    value: '₹28,000',
    icon: IndianRupee,
    color: 'bg-teal-500',
    trend: 'This month'
  }
];

const marketPricesData = [
  { crop: 'Wheat', price: '₹2,150/quintal', change: '+2.5%', positive: true },
  { crop: 'Rice', price: '₹3,200/quintal', change: '-1.2%', positive: false },
  { crop: 'Cotton', price: '₹8,500/quintal', change: '+5.8%', positive: true },
  { crop: 'Sugarcane', price: '₹310/quintal', change: '+0.5%', positive: true },
];

const recommendedListings = [
  { name: 'Premium Wheat', location: 'Punjab', price: '₹2,200/quintal', seller: 'Ramesh Farms' },
  { name: 'Organic Rice', location: 'Haryana', price: '₹3,500/quintal', seller: 'Green Valley' },
  { name: 'Quality Cotton', location: 'Gujarat', price: '₹8,800/quintal', seller: 'Patel Agro' },
];

export function DashboardContent({ currentRole, enabledRoles }: DashboardContentProps) {
  const getWidgets = () => {
    const widgets = [];
    
    if (enabledRoles.includes('buyer')) {
      widgets.push(...buyerWidgets);
    }
    if (enabledRoles.includes('seller')) {
      widgets.push(...sellerWidgets);
    }
    if (enabledRoles.includes('equipment')) {
      widgets.push(...equipmentWidgets);
    }
    if (enabledRoles.includes('service')) {
      widgets.push(...serviceWidgets);
    }
    
    return widgets;
  };

  const widgets = getWidgets();

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <div
              key={widget.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${widget.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif]">
                  {widget.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif] mb-1">
                {widget.title}
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-gray-900">
                {widget.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Market Prices - Full Width - Show for sellers and buyers */}
      {(enabledRoles.includes('seller') || enabledRoles.includes('buyer')) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-4">
            Today's Market Prices
          </h3>
          <div className="space-y-3">
            {marketPricesData.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900">
                    {item.crop}
                  </p>
                  <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                    {item.price}
                  </p>
                </div>
                <span className={`text-sm font-medium font-['Geologica:Regular',sans-serif] ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Listings - Show for buyers */}
      {enabledRoles.includes('buyer') && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-4">
            Recommended for You
          </h3>
          <div className="space-y-3">
            {recommendedListings.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium text-[#64b900] font-['Geologica:Regular',sans-serif]">
                    {item.price}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-['Geologica:Regular',sans-serif]">📍 {item.location}</span>
                  <span className="font-['Geologica:Regular',sans-serif]">👤 {item.seller}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 py-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-['Geologica:Regular',sans-serif] text-gray-900">New order received</p>
              <p className="text-sm text-gray-500 font-['Geologica:Regular',sans-serif]">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Gavel className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-['Geologica:Regular',sans-serif] text-gray-900">Bid placed on Premium Wheat</p>
              <p className="text-sm text-gray-500 font-['Geologica:Regular',sans-serif]">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-['Geologica:Regular',sans-serif] text-gray-900">Payment received: ₹45,000</p>
              <p className="text-sm text-gray-500 font-['Geologica:Regular',sans-serif]">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}