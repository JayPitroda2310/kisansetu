import { useState } from 'react';

interface LocationScreenProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isFirstStep: boolean;
}

export function LocationScreen({ data, onNext, onPrevious, isFirstStep }: LocationScreenProps) {
  const [location, setLocation] = useState(data.location || {
    state: '',
    district: '',
    village: ''
  });
  
  const [errors, setErrors] = useState({
    state: '',
    district: '',
    village: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {
      state: location.state ? '' : 'Please select a state',
      district: location.district ? '' : 'Please select a district',
      village: location.village ? '' : 'Please enter your village name'
    };
    
    setErrors(newErrors);
    
    if (newErrors.state || newErrors.district || newErrors.village) {
      return;
    }
    
    onNext(location);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation({
      state: e.target.value,
      district: '',
      village: ''
    });
    setErrors({ state: '', district: '', village: '' });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation({
      ...location,
      district: e.target.value,
      village: ''
    });
    setErrors({ ...errors, district: '', village: '' });
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation({
      ...location,
      village: e.target.value
    });
    setErrors({ ...errors, village: '' });
  };

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Districts data - Currently only Gujarat is implemented
  const districtsByState: Record<string, string[]> = {
    'Gujarat': [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
      'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
      'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
      'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
      'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
      'Tapi', 'Vadodara', 'Valsad'
    ]
  };

  const availableDistricts = location.state ? districtsByState[location.state] || [] : [];

  return (
    <div className="p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-['Fraunces',sans-serif] text-4xl mb-2">
          <span className="text-black">Welcome to </span>
          <span className="text-[#64b900]">KisanSetu</span>
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-base text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Let's start by knowing where you're from
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* State */}
        <div>
          <label 
            htmlFor="state" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            name="state"
            value={location.state}
            onChange={handleStateChange}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="">Select your state</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-xs text-red-500 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {errors.state}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label 
            htmlFor="district" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            District <span className="text-red-500">*</span>
          </label>
          <select
            id="district"
            name="district"
            value={location.district}
            onChange={handleDistrictChange}
            disabled={!location.state}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-black/40"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="">
              {location.state 
                ? (availableDistricts.length > 0 ? 'Select your district' : 'No districts available') 
                : 'Select state first'}
            </option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="mt-1 text-xs text-red-500 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {errors.district}
            </p>
          )}
        </div>

        {/* Village */}
        <div>
          <label 
            htmlFor="village" 
            className="block font-['Geologica:Regular',sans-serif] mb-2 text-sm" 
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Village <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="village"
            name="village"
            value={location.village}
            onChange={handleVillageChange}
            disabled={!location.district}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-black/40"
            placeholder={location.district ? "Enter your village name" : "Select district first"}
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          />
          {errors.village && (
            <p className="mt-1 text-xs text-red-500 font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {errors.village}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="flex-1 bg-white border-2 border-black/20 text-black py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-gray-50 transition-colors text-sm"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}