interface CompletionScreenProps {
  data: any;
  onComplete: () => void;
}

export function CompletionScreen({ data, onComplete }: CompletionScreenProps) {
  const getActivityLabel = (activityId: string) => {
    const labels: Record<string, string> = {
      'sell-crop': 'Selling Crops',
      'buy-crops': 'Buying Crops',
      'rent-machinery': 'Renting Machinery',
      'give-machinery': 'Equipment Rental',
      'provide-transport': 'Transport Services',
      'represent-fpo': 'FPO Representative'
    };
    return labels[activityId] || activityId;
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-['Fraunces',sans-serif] text-3xl mb-2 text-black">
          Your account is ready!
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Welcome to the <span className="text-[#64b900]">KisanSetu</span> community
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-2.5 mb-6">
        {/* Location Card */}
        <div className="bg-white rounded-lg border-2 border-black/10 p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#64b900]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base">📍</span>
            </div>
            <div>
              <h3 className="font-['Geologica:Regular',sans-serif] text-sm mb-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Location
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {data.location.village}, {data.location.district}, {data.location.state}
              </p>
            </div>
          </div>
        </div>

        {/* Enabled Services */}
        {data.selectedActivities.map((activity: string) => (
          <div key={activity} className="bg-white rounded-lg border-2 border-[#64b900]/20 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#64b900] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {getActivityLabel(activity)} Enabled
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Details */}
      {(data.farmingDetails || data.equipmentDetails || data.transportDetails) && (
        <div className="bg-[#fd0]/10 border-2 border-[#fd0]/30 rounded-lg p-3 mb-6">
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/70 text-center" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            ✨ Your profile is now complete and ready to connect with the community
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="w-full bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-sm"
        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
      >
        Go to Dashboard
      </button>

      {/* Help Text */}
      <p className="text-center mt-3 font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
        You can update your preferences anytime from your profile
      </p>
    </div>
  );
}