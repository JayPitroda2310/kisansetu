import { useState } from 'react';

interface FarmingDetailsScreenProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

export function FarmingDetailsScreen({ data, onNext, onPrevious }: FarmingDetailsScreenProps) {
  const [details, setDetails] = useState(data.farmingDetails || {
    crops: [] as string[],
    landSize: '',
    sellingMethod: ''
  });

  const commonCrops = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
    'Soybean', 'Pulses', 'Vegetables', 'Fruits', 'Other'
  ];

  const sellingMethods = [
    'Mandi',
    'Local Trader',
    'Direct to Consumer',
    'FPO/Cooperative',
    'Contract Farming'
  ];

  const toggleCrop = (crop: string) => {
    setDetails((prev: any) => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter((c: string) => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (details.crops.length === 0) {
      alert('Please select at least one crop');
      return;
    }
    onNext(details);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="font-['Fraunces',sans-serif] text-3xl mb-1 text-black">
          Tell us about your farming
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          This helps us connect you with the right buyers
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Crops */}
        <div>
          <label className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Crops you grow
          </label>
          <div className="flex flex-wrap gap-2">
            {commonCrops.map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => toggleCrop(crop)}
                className={`px-3 py-1.5 rounded-full border-2 font-['Geologica:Regular',sans-serif] text-sm transition-all ${
                  details.crops.includes(crop)
                    ? 'bg-[#64b900] text-white border-[#64b900]'
                    : 'bg-white text-black border-black/20 hover:border-[#64b900]'
                }`}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Land Size */}
        <div>
          <label 
            htmlFor="landSize" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Approx land size
          </label>
          <div className="relative">
            <input
              type="text"
              id="landSize"
              value={details.landSize}
              onChange={(e) => setDetails({ ...details, landSize: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
              placeholder="e.g., 5"
              required
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              acres
            </span>
          </div>
        </div>

        {/* Selling Method */}
        <div>
          <label 
            htmlFor="sellingMethod" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Usual selling method
          </label>
          <select
            id="sellingMethod"
            value={details.sellingMethod}
            onChange={(e) => setDetails({ ...details, sellingMethod: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
            required
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="">Select a method</option>
            {sellingMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onPrevious}
            className="flex-1 bg-white border-2 border-black/20 text-black py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm hover:bg-gray-50 transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Previous
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm hover:bg-[#559900] transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}