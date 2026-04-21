import { X, CheckCircle2 } from 'lucide-react';

interface ProfileCompletionBannerProps {
  completion: number;
  onDismiss: () => void;
  onNavigateToProfile: () => void;
}

export function ProfileCompletionBanner({ completion, onDismiss, onNavigateToProfile }: ProfileCompletionBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#64b900]/10 to-[#fd0]/10 border border-[#64b900]/30 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-[#64b900]" />
            <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900">
              Complete your profile to unlock all features
            </h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                Profile Completion
              </span>
              <span className="text-sm font-medium text-[#64b900] font-['Geologica:Regular',sans-serif]">
                {completion}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#64b900] to-[#559900] h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>

          <button 
            onClick={onNavigateToProfile}
            className="bg-[#64b900] text-white px-6 py-2.5 rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] shadow-sm"
          >
            Complete Profile
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}