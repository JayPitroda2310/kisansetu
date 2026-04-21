import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

interface EquipmentDetailsScreenProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

interface Equipment {
  equipmentType: string;
  quantity: string;
  rentalPrice: string;
  rentalUnit: string;
  availableDays: string;
}

export function EquipmentDetailsScreen({ data, onNext, onPrevious }: EquipmentDetailsScreenProps) {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(
    data.equipmentDetails || [
      {
        equipmentType: '',
        quantity: '',
        rentalPrice: '',
        rentalUnit: 'hour',
        availableDays: ''
      }
    ]
  );

  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const equipmentTypes = [
    { value: 'tractor', label: 'Tractor' },
    { value: 'harvester', label: 'Harvester' },
    { value: 'thresher', label: 'Thresher' },
    { value: 'rotavator', label: 'Rotavator' },
    { value: 'cultivator', label: 'Cultivator' },
    { value: 'plough', label: 'Plough' },
    { value: 'seeder', label: 'Seeder' },
    { value: 'sprayer', label: 'Sprayer' },
    { value: 'other', label: 'Other Equipment' }
  ];

  const availableDaysOptions = [
    { value: 'all-days', label: 'All Days' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
    { value: 'weekdays', label: 'Weekdays Only' },
    { value: 'weekends', label: 'Weekends Only' }
  ];

  const addEquipment = () => {
    setEquipmentList([
      ...equipmentList,
      {
        equipmentType: '',
        quantity: '',
        rentalPrice: '',
        rentalUnit: 'hour',
        availableDays: ''
      }
    ]);
    setExpandedIndex(equipmentList.length); // Expand the new equipment
  };

  const removeEquipment = (index: number) => {
    if (equipmentList.length > 1) {
      setEquipmentList(equipmentList.filter((_, i) => i !== index));
      // Adjust expanded index if needed
      if (expandedIndex >= equipmentList.length - 1) {
        setExpandedIndex(equipmentList.length - 2);
      }
    }
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: string) => {
    const updated = [...equipmentList];
    updated[index] = { ...updated[index], [field]: value };
    setEquipmentList(updated);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const getEquipmentLabel = (equipment: Equipment) => {
    const type = equipmentTypes.find(t => t.value === equipment.equipmentType);
    return type ? type.label : 'Not selected';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all equipment entries are complete
    const isValid = equipmentList.every(
      (eq) => eq.equipmentType && eq.quantity && eq.rentalPrice && eq.availableDays
    );
    
    if (!isValid) {
      alert('Please fill in all fields for each equipment');
      return;
    }
    
    onNext(equipmentList);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="font-['Fraunces',sans-serif] text-3xl mb-1 text-black">
          Tell us about your equipment
        </h2>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Help farmers find the right equipment
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {equipmentList.map((equipment, index) => (
          <div key={index} className="border-2 border-black/10 rounded-lg overflow-hidden">
            {/* Equipment Header */}
            <div
              className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Equipment {index + 1}
                </span>
                {expandedIndex !== index && equipment.equipmentType && (
                  <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    • {getEquipmentLabel(equipment)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {equipmentList.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEquipment(index);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    aria-label="Remove equipment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-black/60 -mr-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-black/60 -mr-1" />
                )}
              </div>
            </div>

            {/* Equipment Details (Expandable) */}
            {expandedIndex === index && (
              <div className="p-4 pt-0 space-y-3 bg-white">
                {/* Equipment Type Dropdown */}
                <div>
                  <label 
                    htmlFor={`equipmentType-${index}`}
                    className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Equipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`equipmentType-${index}`}
                    value={equipment.equipmentType}
                    onChange={(e) => updateEquipment(index, 'equipmentType', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                    required
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select equipment type</option>
                    {equipmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label 
                    htmlFor={`quantity-${index}`}
                    className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    value={equipment.quantity}
                    onChange={(e) => updateEquipment(index, 'quantity', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                    placeholder="e.g., 1"
                    min="1"
                    required
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                {/* Rental Price */}
                <div>
                  <label 
                    htmlFor={`rentalPrice-${index}`}
                    className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Rental price <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        ₹
                      </span>
                      <input
                        type="number"
                        id={`rentalPrice-${index}`}
                        value={equipment.rentalPrice}
                        onChange={(e) => updateEquipment(index, 'rentalPrice', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                        placeholder="500"
                        required
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>
                    <select
                      value={equipment.rentalUnit}
                      onChange={(e) => updateEquipment(index, 'rentalUnit', e.target.value)}
                      className="px-3 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      <option value="hour">per hour</option>
                      <option value="day">per day</option>
                      <option value="acre">per acre</option>
                    </select>
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <label 
                    htmlFor={`availableDays-${index}`}
                    className="block font-['Geologica:Regular',sans-serif] mb-1.5 text-sm" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Available days <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`availableDays-${index}`}
                    value={equipment.availableDays}
                    onChange={(e) => updateEquipment(index, 'availableDays', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-black/10 focus:border-[#64b900] focus:outline-none bg-white font-['Geologica:Regular',sans-serif] text-sm"
                    required
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select available days</option>
                    {availableDaysOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Another Equipment Button */}
        <button
          type="button"
          onClick={addEquipment}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-[#64b900] text-[#64b900] hover:bg-[#64b900]/5 transition-colors font-['Geologica:Regular',sans-serif] text-sm"
          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
        >
          <Plus className="w-4 h-4" />
          Add Another Equipment
        </button>

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