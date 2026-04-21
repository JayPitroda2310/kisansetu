import { ShoppingCart, Package, Tractor, Truck, Plus } from 'lucide-react';
import { UserRole } from './DashboardLayout';

interface ActivityCard {
  role: UserRole;
  icon: any;
  title: string;
  description: string;
}

const activityCards: ActivityCard[] = [
  {
    role: 'buyer',
    icon: ShoppingCart,
    title: 'Buying Crops',
    description: 'Purchase quality crops from farmers'
  },
  {
    role: 'seller',
    icon: Package,
    title: 'Selling Crops',
    description: 'List and sell your farm produce'
  },
  {
    role: 'equipment',
    icon: Tractor,
    title: 'Equipment Rental',
    description: 'Rent out your farming equipment'
  },
  {
    role: 'service',
    icon: Truck,
    title: 'Transport Services',
    description: 'Provide logistics and transport'
  }
];

interface ActivitiesSectionProps {
  enabledRoles: UserRole[];
  onAddActivity: () => void;
}

export function ActivitiesSection({ enabledRoles, onAddActivity }: ActivitiesSectionProps) {
  return (
    <div>
      <h2 className="font-['Geologica:Regular',sans-serif] mb-4 text-gray-900">
        Your Activities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enabled Activity Cards */}
        {activityCards.map((activity) => {
          const isEnabled = enabledRoles.includes(activity.role);
          if (!isEnabled) return null;

          const Icon = activity.icon;

          return (
            <div
              key={activity.role}
              className="bg-white border-2 border-[#64b900] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-[#64b900]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#64b900]" />
                </div>
                <span className="px-2 py-1 bg-[#64b900] text-white text-xs rounded-full font-['Geologica:Regular',sans-serif]">
                  Active
                </span>
              </div>
              <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-1">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                {activity.description}
              </p>
            </div>
          );
        })}

        {/* Add New Activity Card */}
        <button
          onClick={onAddActivity}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#64b900] hover:bg-[#64b900]/5 transition-all group"
        >
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px]">
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#64b900]/10 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#64b900] transition-colors" />
            </div>
            <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-1">
              Add New Activity
            </h3>
            <p className="text-sm text-gray-500 font-['Geologica:Regular',sans-serif]">
              Expand your business
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
