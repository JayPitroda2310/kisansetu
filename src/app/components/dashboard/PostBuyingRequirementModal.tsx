import { useState } from 'react';
import { X, ChevronLeft, Wheat, IndianRupee, MapPin, FileText } from 'lucide-react';

interface RequirementFormData {
  // Step 1: Crop Details
  cropType: string;
  variety: string;
  qualityGrade: string;
  
  // Step 2: Quantity & Budget
  quantity: string;
  unit: 'kg' | 'quintal' | 'ton';
  minPrice: string;
  maxPrice: string;
  
  // Step 3: Delivery & Timeline
  deliveryLocation: string;
  state: string;
  district: string;
  deadline: string;
  
  // Step 4: Additional Details
  additionalNotes: string;
  urgency: 'normal' | 'urgent';
}

interface PostBuyingRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequirementFormData) => void;
}

export function PostBuyingRequirementModal({ isOpen, onClose, onSubmit }: PostBuyingRequirementModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RequirementFormData>({
    cropType: '',
    variety: '',
    qualityGrade: '',
    quantity: '',
    unit: 'quintal',
    minPrice: '',
    maxPrice: '',
    deliveryLocation: '',
    state: '',
    district: '',
    deadline: '',
    additionalNotes: '',
    urgency: 'normal'
  });

  const steps = [
    { number: 1, label: 'Crop\nDetails', icon: Wheat },
    { number: 2, label: 'Quantity\n& Budget', icon: IndianRupee },
    { number: 3, label: 'Delivery\n& Timeline', icon: MapPin },
    { number: 4, label: 'Review\n& Submit', icon: FileText }
  ];

  const updateFormData = (field: keyof RequirementFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    // Reset form
    setCurrentStep(1);
    setFormData({
      cropType: '',
      variety: '',
      qualityGrade: '',
      quantity: '',
      unit: 'quintal',
      minPrice: '',
      maxPrice: '',
      deliveryLocation: '',
      state: '',
      district: '',
      deadline: '',
      additionalNotes: '',
      urgency: 'normal'
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.cropType && formData.qualityGrade;
      case 2:
        return formData.quantity && formData.minPrice && formData.maxPrice;
      case 3:
        return formData.deliveryLocation && formData.state && formData.district && formData.deadline;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-black/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
              Post Buying Requirement
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Step {currentStep} of 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b-2 border-black/10">
          <div className="flex items-center max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center" style={{ flex: index < steps.length - 1 ? '1 1 0%' : '0 0 auto' }}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                        ${isCompleted 
                          ? 'bg-[#64b900] border-[#64b900]' 
                          : isActive
                          ? 'bg-white border-[#64b900] ring-4 ring-[#64b900]/20'
                          : 'bg-white border-black/20'
                        }
                      `}
                    >
                      <Icon 
                        className={`w-6 h-6 ${
                          isCompleted ? 'text-white' : 
                          isActive ? 'text-[#64b900]' : 
                          'text-black/40'
                        }`} 
                      />
                    </div>
                    <p 
                      className={`
                        mt-2 text-xs text-center font-['Geologica:Regular',sans-serif] whitespace-pre-line
                        ${isActive || isCompleted ? 'text-black' : 'text-black/50'}
                      `}
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-black/10 mx-4 -mt-8">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          currentStep > step.number ? 'bg-[#64b900] w-full' : 'bg-transparent w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Step 1: Crop Details */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Crop Type <span className="text-[#64b900]">*</span>
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => updateFormData('cropType', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Barley">Barley</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Potato">Potato</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Variety (Optional)
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => updateFormData('variety', e.target.value)}
                  placeholder="e.g., HD-2967, Basmati 1121"
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Quality Grade <span className="text-[#64b900]">*</span>
                </label>
                <select
                  value={formData.qualityGrade}
                  onChange={(e) => updateFormData('qualityGrade', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                >
                  <option value="">Select grade</option>
                  <option value="Premium (A+)">Premium (A+)</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Standard">Standard</option>
                  <option value="Any">Any Grade</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Quantity & Budget */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Unit and Quantity Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Unit <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => updateFormData('unit', e.target.value as 'kg' | 'quintal' | 'ton')}
                    className="w-full px-4 py-3.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] focus:ring-4 focus:ring-[#64b900]/10 transition-all font-['Geologica:Regular',sans-serif] text-[15px]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Quantity Required <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => updateFormData('quantity', e.target.value)}
                    placeholder={`Enter quantity in ${formData.unit}`}
                    className="w-full px-4 py-3.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] focus:ring-4 focus:ring-[#64b900]/10 transition-all font-['Geologica:Regular',sans-serif] text-[15px]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    required
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Expected Price Range (per {formData.unit}) <span className="text-[#64b900]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => updateFormData('minPrice', e.target.value)}
                      placeholder="Min price (₹)"
                      className="w-full px-4 py-3.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] focus:ring-4 focus:ring-[#64b900]/10 transition-all font-['Geologica:Regular',sans-serif] text-[15px]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => updateFormData('maxPrice', e.target.value)}
                      placeholder="Max price (₹)"
                      className="w-full px-4 py-3.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] focus:ring-4 focus:ring-[#64b900]/10 transition-all font-['Geologica:Regular',sans-serif] text-[15px]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Budget Estimate Card */}
              {formData.quantity && formData.minPrice && formData.maxPrice && (
                <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-xl p-5 border-2 border-[#64b900]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-[#64b900]" />
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Estimated Total Budget:
                    </p>
                  </div>
                  <p className="font-['Geologica:Regular',sans-serif] text-2xl text-[#64b900] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    ₹{(parseFloat(formData.quantity) * parseFloat(formData.minPrice)).toLocaleString('en-IN')} - ₹{(parseFloat(formData.quantity) * parseFloat(formData.maxPrice)).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Delivery & Timeline */}
          {currentStep === 3 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  State <span className="text-[#64b900]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="e.g., Uttar Pradesh"
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                />
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  District <span className="text-[#64b900]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => updateFormData('district', e.target.value)}
                  placeholder="e.g., Meerut"
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                />
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Delivery Location (Full Address) <span className="text-[#64b900]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.deliveryLocation}
                  onChange={(e) => updateFormData('deliveryLocation', e.target.value)}
                  placeholder="Complete delivery address"
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                />
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Deadline <span className="text-[#64b900]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateFormData('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  required
                />
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Urgency
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => updateFormData('urgency', 'normal')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-['Geologica:Regular',sans-serif] ${
                      formData.urgency === 'normal'
                        ? 'border-[#64b900] bg-[#64b900]/10 text-[#64b900]'
                        : 'border-black/10 text-black hover:border-[#64b900]/50'
                    }`}
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('urgency', 'urgent')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-['Geologica:Regular',sans-serif] ${
                      formData.urgency === 'urgent'
                        ? 'border-[#64b900] bg-[#64b900]/10 text-[#64b900]'
                        : 'border-black/10 text-black hover:border-[#64b900]/50'
                    }`}
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Urgent
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                  placeholder="Add any specific requirements, quality standards, or special instructions..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] resize-none"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-black/10">
                <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                  Requirement Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Crop:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formData.cropType} {formData.variety && `- ${formData.variety}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Quality:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formData.qualityGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Quantity:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formData.quantity} {formData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Price Range:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>₹{formData.minPrice} - ₹{formData.maxPrice} per {formData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{formData.district}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Deadline:</span>
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{new Date(formData.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Urgency:</span>
                    <span className={`font-['Geologica:Regular',sans-serif] ${formData.urgency === 'urgent' ? 'text-[#64b900]' : 'text-black'}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {formData.urgency === 'urgent' ? '🔥 Urgent' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-2 border-black/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-6 py-3 border-2 border-black/20 rounded-lg font-['Geologica:Regular',sans-serif] text-black hover:bg-gray-50 transition-colors"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                Back
              </>
            )}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-8 py-3 rounded-lg font-['Geologica:Regular',sans-serif] transition-colors shadow-lg ${
                isStepValid()
                  ? 'bg-[#64b900] text-white hover:bg-[#52960a]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-[#64b900] text-white rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#52960a] transition-colors shadow-lg"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Submit Requirement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}