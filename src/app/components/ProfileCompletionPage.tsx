import { useState } from 'react';
import { User, MapPin, Briefcase, FileText, CheckCircle2, Upload } from 'lucide-react';

interface ProfileData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Professional Details
  occupation: string;
  farmSize: string;
  farmingType: string;
  mainCrops: string;
  
  // Bank Details
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  
  // Documents
  aadharNumber: string;
  panNumber: string;
}

interface ProfileCompletionPageProps {
  onComplete: () => void;
  initialData?: Partial<ProfileData>;
}

export function ProfileCompletionPage({ onComplete, initialData }: ProfileCompletionPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    occupation: 'farmer',
    farmSize: '',
    farmingType: '',
    mainCrops: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
    aadharNumber: '',
    panNumber: '',
  });

  const steps = [
    { number: 1, label: 'Personal Info', icon: User },
    { number: 2, label: 'Address', icon: MapPin },
    { number: 3, label: 'Professional', icon: Briefcase },
    { number: 4, label: 'Documents', icon: FileText },
  ];

  const updateFormData = (field: keyof ProfileData, value: string) => {
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

  const handleComplete = () => {
    console.log('Profile completed:', formData);
    onComplete();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.dateOfBirth && formData.gender;
      case 2:
        return formData.address && formData.city && formData.state && formData.pincode;
      case 3:
        return formData.occupation && (formData.occupation !== 'farmer' || (formData.farmSize && formData.farmingType));
      case 4:
        return formData.aadharNumber && formData.panNumber;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefaf0] to-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border-2 border-black/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#64b900] to-[#559900] px-8 py-6 text-white">
          <h1 className="font-['Fraunces',sans-serif] text-3xl mb-2">
            Complete Your Profile
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-white/90" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Please fill in all required information to access your dashboard
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 py-6 border-b-2 border-black/10 bg-[#64b900]/5">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-['Geologica:Regular',sans-serif] font-bold transition-all border-2"
                      style={{
                        fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                        backgroundColor: 
                          currentStep > step.number ? '#64b900' :
                          currentStep === step.number ? '#64b900' : 'white',
                        borderColor: 
                          currentStep >= step.number ? '#64b900' : '#00000020',
                        color: 
                          currentStep >= step.number ? 'white' : '#00000040',
                        boxShadow: currentStep >= step.number ? '0 4px 12px rgba(100, 185, 0, 0.3)' : 'none'
                      }}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {/* Label */}
                    <div
                      className="mt-2 text-sm text-center font-['Geologica:Regular',sans-serif]"
                      style={{
                        fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                        color: currentStep >= step.number ? 'black' : '#00000040',
                        fontWeight: currentStep === step.number ? '600' : '400'
                      }}
                    >
                      {step.label}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className="h-1 flex-1 mx-3 mb-8 rounded-full"
                      style={{
                        backgroundColor: currentStep > step.number ? '#64b900' : '#00000020'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8 min-h-[400px]">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Full Name <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Email Address <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Phone Number <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Date of Birth <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Gender <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Address Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Full Address <span className="text-[#64b900]">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="House No., Street Name, Locality"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors resize-none font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      City <span className="text-[#64b900]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    />
                  </div>

                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      State <span className="text-[#64b900]">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      <option value="">Select state</option>
                      <option value="punjab">Punjab</option>
                      <option value="haryana">Haryana</option>
                      <option value="up">Uttar Pradesh</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="rajasthan">Rajasthan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      PIN Code <span className="text-[#64b900]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => updateFormData('pincode', e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Professional Details */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Professional Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Occupation <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.occupation}
                    onChange={(e) => updateFormData('occupation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="farmer">Farmer</option>
                    <option value="buyer">Buyer/Trader</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {(formData.occupation === 'farmer' || formData.occupation === 'both') && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Farm Size (in acres) <span className="text-[#64b900]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.farmSize}
                          onChange={(e) => updateFormData('farmSize', e.target.value)}
                          placeholder="e.g., 5 acres"
                          className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        />
                      </div>

                      <div>
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Farming Type <span className="text-[#64b900]">*</span>
                        </label>
                        <select
                          value={formData.farmingType}
                          onChange={(e) => updateFormData('farmingType', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        >
                          <option value="">Select type</option>
                          <option value="organic">Organic</option>
                          <option value="conventional">Conventional</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Main Crops
                      </label>
                      <input
                        type="text"
                        value={formData.mainCrops}
                        onChange={(e) => updateFormData('mainCrops', e.target.value)}
                        placeholder="e.g., Wheat, Rice, Cotton"
                        className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>
                  </>
                )}

                <div className="bg-[#64b900]/10 border-2 border-[#64b900]/20 rounded-lg p-4">
                  <h4 className="font-['Geologica:Regular',sans-serif] font-semibold text-black mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Bank Account Details (Optional - Can be added later)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-['Geologica:Regular',sans-serif] text-xs font-medium mb-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => updateFormData('accountNumber', e.target.value)}
                        placeholder="Enter account number"
                        className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black placeholder:text-black/30 focus:outline-none focus:border-[#64b900] transition-colors text-sm font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>
                    <div>
                      <label className="block font-['Geologica:Regular',sans-serif] text-xs font-medium mb-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => updateFormData('ifscCode', e.target.value)}
                        placeholder="Enter IFSC code"
                        className="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-black placeholder:text-black/30 focus:outline-none focus:border-[#64b900] transition-colors text-sm font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Identity Verification
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Aadhar Number <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => updateFormData('aadharNumber', e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    PAN Number <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => updateFormData('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] uppercase"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-900 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        <strong>Why we need this:</strong>
                      </p>
                      <ul className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800 space-y-1 list-disc list-inside" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        <li>To verify your identity and ensure platform security</li>
                        <li>To enable secure transactions and payments</li>
                        <li>To comply with government regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t-2 border-black/10 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2.5 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 bg-white text-black"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Back
          </button>

          {currentStep === 4 ? (
            <button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="px-8 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] font-medium transition-all bg-[#64b900] text-white hover:bg-[#559900] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Complete Profile & Continue
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] font-medium transition-all bg-[#64b900] text-white hover:bg-[#559900] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
