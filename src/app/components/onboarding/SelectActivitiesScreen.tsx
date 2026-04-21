import { useState } from 'react';

interface SelectActivitiesScreenProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

export function SelectActivitiesScreen({ data, onNext, onPrevious }: SelectActivitiesScreenProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(data.selectedActivities || []);

  const activities = [
    { id: 'sell-crop', label: 'Sell My Crop' },
    { id: 'buy-crops', label: 'Buy Crops' },
    { id: 'rent-machinery', label: 'Rent Machinery' },
    { id: 'give-machinery', label: 'Give Machinery on Rent' },
    { id: 'provide-transport', label: 'Provide Transport / Service' },
    { id: 'represent-fpo', label: 'Represent an FPO' }
  ];

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivities.length === 0) {
      alert('Please select at least one activity');
      return;
    }
    onNext(selectedActivities);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-['Fraunces',sans-serif] text-3xl mb-2 text-black whitespace-nowrap">
          What would you like to do?
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          You can choose more than one.
        </p>
      </div>

      {/* Activity List */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-2.5 mb-6">
          {activities.map((activity) => (
            <label
              key={activity.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedActivities.includes(activity.id)
                  ? 'border-[#64b900] bg-[#64b900]/10'
                  : 'border-black/10 bg-white hover:border-[#64b900]/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedActivities.includes(activity.id)}
                onChange={() => toggleActivity(activity.id)}
                className="w-4 h-4 accent-[#64b900] cursor-pointer flex-shrink-0"
              />
              <span className="font-['Geologica:Regular',sans-serif] text-sm flex-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {activity.label}
              </span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onPrevious}
            className="flex-1 bg-white border-2 border-black/20 text-black py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-gray-50 transition-colors text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Previous
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors disabled:opacity-50 text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            disabled={selectedActivities.length === 0}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}