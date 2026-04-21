import { useState } from 'react';

interface TransportDetailsScreenProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

export function TransportDetailsScreen({ data, onNext, onPrevious }: TransportDetailsScreenProps) {
  const [details, setDetails] = useState(data.transportDetails || {
    vehicleType: '',
    loadCapacity: '',
    serviceRadius: ''
  });

  const vehicleTypes = [
    { value: 'pickup', label: '🚚 Pickup Truck' },
    { value: 'mini-truck', label: '🚛 Mini Truck' },
    { value: 'truck', label: '🚛 Truck' },
    { value: 'tempo', label: '🛻 Tempo' },
    { value: 'tractor-trolley', label: '🚜 Tractor with Trolley' },
    { value: 'other', label: '📦 Other' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(details);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-['Fraunces',sans-serif] text-4xl mb-2 text-black">
          Tell us about your vehicle
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-base text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Connect with farmers who need transport services
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Type */}
        <div>
          <label 
            className="block font-['Geologica:Regular',sans-serif] mb-3 text-base" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Vehicle type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vehicleTypes.map((vehicle) => (
              <button
                key={vehicle.value}
                type="button"
                onClick={() => setDetails({ ...details, vehicleType: vehicle.value })}
                className={`p-4 rounded-lg border-2 font-['Geologica:Regular',sans-serif] transition-all text-center ${
                  details.vehicleType === vehicle.value
                    ? 'bg-[#64b900] text-white border-[#64b900]'
                    : 'bg-white text-black border-black/20 hover:border-[#64b900]'
                }`}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {vehicle.label}
              </button>
            ))}
          </div>
        </div>

        {/* Load Capacity */}
        <div>
          <label 
            htmlFor="loadCapacity" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-base" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Load capacity
          </label>
          <div className="relative">
            <input
              type="text"
              id="loadCapacity"
              value={details.loadCapacity}
              onChange={(e) => setDetails({ ...details, loadCapacity: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
              placeholder="e.g., 5"
              required
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              tons
            </span>
          </div>
        </div>

        {/* Service Radius */}
        <div>
          <label 
            htmlFor="serviceRadius" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-base" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Service radius
          </label>
          <div className="relative">
            <input
              type="number"
              id="serviceRadius"
              value={details.serviceRadius}
              onChange={(e) => setDetails({ ...details, serviceRadius: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif]"
              placeholder="e.g., 50"
              required
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              km
            </span>
          </div>
          <p className="mt-2 text-sm text-black/60 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            How far are you willing to travel for service?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="flex-1 bg-white border-2 border-black/20 text-black py-3 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-gray-50 transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Previous
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#64b900] text-white py-3 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Finish Setup
          </button>
        </div>
      </form>
    </div>
  );
}