import { useState } from 'react';
import { X, Package, Tractor, Truck, ChevronRight } from 'lucide-react';
import { UserRole } from './DashboardLayout';

interface ActivityOption {
  role: UserRole;
  icon: any;
  title: string;
  description: string;
}

const activityOptions: ActivityOption[] = [
  {
    role: 'seller',
    icon: Package,
    title: 'Start Selling',
    description: 'List your crops and farm produce for sale'
  },
  {
    role: 'equipment',
    icon: Tractor,
    title: 'Provide Equipment',
    description: 'Rent out your farming machinery and equipment'
  },
  {
    role: 'service',
    icon: Truck,
    title: 'Offer Transport Services',
    description: 'Provide logistics and transportation services'
  }
];

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoles: UserRole[];
  onAdd: (roles: UserRole[]) => void;
}

export function AddActivityModal({ isOpen, onClose, currentRoles, onAdd }: AddActivityModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const availableActivities = activityOptions.filter(
    activity => !currentRoles.includes(activity.role)
  );

  if (availableActivities.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <div 
          className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-md p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="font-['Geologica:Regular',sans-serif] mb-2 text-gray-900">All Activities Enabled</h2>
            <p className="text-gray-600 font-['Geologica:Regular',sans-serif] mb-6">
              You've already enabled all available activities!
            </p>
            <button
              onClick={onClose}
              className="bg-[#64b900] text-white px-6 py-2.5 rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleContinue = () => {
    if (selectedRoles.length > 0) {
      setShowConfirmation(true);
      setTimeout(() => {
        onAdd(selectedRoles);
        setShowConfirmation(false);
        setSelectedRoles([]);
      }, 2000);
    }
  };

  if (showConfirmation) {
    const roleNames = selectedRoles.map(role => {
      const activity = activityOptions.find(a => a.role === role);
      return activity?.title;
    }).join(', ');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-[#64b900] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-['Geologica:Regular',sans-serif] mb-2 text-gray-900">Success!</h2>
          <p className="text-gray-600 font-['Geologica:Regular',sans-serif]">
            You can now use {roleNames} on KisanSetu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#fefaf0] border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="font-['Geologica:Regular',sans-serif] text-gray-900 mb-1">
              Add New Activity
            </h2>
            <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
              What would you like to start?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4">
          {availableActivities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = selectedRoles.includes(activity.role);

            return (
              <button
                key={activity.role}
                onClick={() => toggleRole(activity.role)}
                className={`
                  w-full p-6 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-[#64b900] bg-[#64b900]/5 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-[#64b900] text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                      {activity.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-[#64b900] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#fefaf0] border-t border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
              {selectedRoles.length} {selectedRoles.length === 1 ? 'activity' : 'activities'} selected
            </p>
            <button
              onClick={handleContinue}
              disabled={selectedRoles.length === 0}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] transition-all
                ${selectedRoles.length > 0
                  ? 'bg-[#64b900] text-white hover:bg-[#559900] shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
