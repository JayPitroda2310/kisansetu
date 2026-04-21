import { useState, useEffect } from 'react';
import { X, ChevronLeft, Upload, Calendar, Package, Check, FileText } from 'lucide-react';

interface ListingFormData {
  // Step 1: Product Details
  cropName: string;
  variety: string;
  grade: string;
  harvestDate: string;
  
  // Step 2: Quantity & Pricing
  quantity: string;
  unit: 'kg' | 'quintal' | 'ton';
  saleType: 'auction' | 'fixed';
  pricePerUnit: string;
  minimumBidIncrement: string;
  maximumBidIncrement: string;
  auctionEndDate: string;
  
  // Step 3: Purchase Type
  purchaseType: 'whole' | 'partial';
  moq: string;
  moqPrice: string;
  
  // Step 4: Quality & Location
  packagingType: string;
  storageType: string;
  state: string;
  district: string;
  pickupMethod: string;
  
  // Step 5: Media & Additional
  images: File[];
  certificate: File | null;
  description: string;
}

interface AddNewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: ListingFormData) => void;
}

export function AddNewListingModal({ isOpen, onClose, onCreate }: AddNewListingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const [formData, setFormData] = useState<ListingFormData>({
    cropName: '',
    variety: '',
    grade: '',
    harvestDate: '',
    quantity: '',
    unit: 'kg',
    saleType: 'auction',
    pricePerUnit: '',
    minimumBidIncrement: '',
    maximumBidIncrement: '',
    auctionEndDate: '',
    purchaseType: 'whole',
    moq: '',
    moqPrice: '',
    packagingType: '',
    storageType: '',
    state: '',
    district: '',
    pickupMethod: '',
    images: [],
    certificate: null,
    description: ''
  });

  // Debug: Log onCreate prop on mount
  useEffect(() => {
    console.log('AddNewListingModal mounted with onCreate:', onCreate);
    console.log('onCreate type:', typeof onCreate);
  }, [onCreate]);

  // Auto-save effect
  useEffect(() => {
    if (!isOpen) return;

    // Trigger auto-save animation whenever form data changes
    setAutoSaveStatus('saving');
    
    const timer = setTimeout(() => {
      // Simulate saving to localStorage or backend
      localStorage.setItem('kisansetu_listing_draft', JSON.stringify(formData));
      setAutoSaveStatus('saved');
      
      // Hide the "saved" status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus(null);
      }, 2000);
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, isOpen]);

  const steps = [
    { number: 1, label: 'Product\nDetails' },
    { number: 2, label: 'Quantity\n& Pricing' },
    { number: 3, label: 'Purchase\nType' },
    { number: 4, label: 'Quality\n& Location' },
    { number: 5, label: 'Media\n& Review' }
  ];

  // Calculate prices
  const calculateTotalPrice = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerUnit) || 0;
    return qty * price;
  };

  const calculateMoqTotal = () => {
    const moqQty = parseFloat(formData.moq) || 0;
    const moqPrice = parseFloat(formData.moqPrice) || 0;
    return moqQty * moqPrice;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const updateFormData = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get min and max datetime for auction end date (current time to 2 days from now)
  const getAuctionDateLimits = () => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}`;
    };
    
    return {
      min: formatDateTime(now),
      max: formatDateTime(twoDaysFromNow)
    };
  };

  // Validation function
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.cropName && formData.variety && formData.grade && formData.harvestDate;
      case 2:
        if (!formData.quantity || !formData.pricePerUnit) return false;
        if (formData.saleType === 'auction') {
          // For auction, validate bid increments
          if (!formData.minimumBidIncrement || !formData.maximumBidIncrement || !formData.auctionEndDate) return false;
          const minBid = parseFloat(formData.minimumBidIncrement);
          const maxBid = parseFloat(formData.maximumBidIncrement);
          // Validate that max is greater than min
          if (maxBid <= minBid) return false;
        }
        return true;
      case 3:
        if (formData.saleType === 'auction') return true; // Skip validation for auction
        if (formData.purchaseType === 'partial') {
          return formData.moq && formData.moqPrice;
        }
        return true;
      case 4:
        return formData.packagingType && formData.storageType && formData.state && formData.district && formData.pickupMethod;
      case 5:
        return formData.images.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      // Skip step 3 (Purchase Type) if sale type is auction
      if (currentStep === 2 && formData.saleType === 'auction') {
        setCurrentStep(4); // Skip to step 4 (Quality & Location)
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Skip step 3 (Purchase Type) when going back if sale type is auction
      if (currentStep === 4 && formData.saleType === 'auction') {
        setCurrentStep(2); // Go back to step 2 (Quantity & Pricing)
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSaveDraft = () => {
    console.log('Save as draft:', formData);
    onClose();
  };

  const handlePublish = () => {
    console.log('Publishing listing with data:', formData);
    console.log('onCreate function:', onCreate);
    console.log('typeof onCreate:', typeof onCreate);
    
    if (typeof onCreate !== 'function') {
      console.error('ERROR: onCreate is not a function!', onCreate);
      alert('Error: onCreate callback is not properly configured');
      return;
    }
    
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-6xl max-h-[95vh] bg-white flex flex-col mx-4 rounded-2xl shadow-2xl border-2 border-black/10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-black/10 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
                Create New Listing
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  List your crop for auction or fixed price sale
                </p>
                {/* Auto-save indicator - always reserves space */}
                <div className="w-[110px] h-[26px]">
                  {autoSaveStatus && (
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#64b900]/10 border border-[#64b900]/20 h-full">
                      {autoSaveStatus === 'saving' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#64b900] animate-pulse flex-shrink-0" />
                          <span className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900] whitespace-nowrap" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Saving...
                          </span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 text-[#64b900] flex-shrink-0" />
                          <span className="font-['Geologica:Regular',sans-serif] text-xs text-[#64b900] whitespace-nowrap" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Auto-saved
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 py-6 border-b-2 border-black/10 bg-[#64b900]/5">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-['Geologica:Regular',sans-serif] text-sm font-bold transition-all border-2"
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
                    {step.number}
                  </div>
                  {/* Label */}
                  <div
                    className="mt-2 text-xs text-center whitespace-pre-line font-['Geologica:Regular',sans-serif]"
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
                    className="h-1 flex-1 mx-2 mb-8 rounded-full"
                    style={{
                      backgroundColor: currentStep > step.number ? '#64b900' : '#00000020'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Product Details
              </h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Crop Name */}
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Crop Name <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.cropName}
                    onChange={(e) => updateFormData('cropName', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", backgroundPosition: 'right 0.5rem center' }}
                  >
                    <option value="">Select crop</option>
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="corn">Corn</option>
                    <option value="soybean">Soybean</option>
                    <option value="cotton">Cotton</option>
                  </select>
                </div>

                {/* Variety */}
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Variety
                  </label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => updateFormData('variety', e.target.value)}
                    placeholder="e.g., Basmati, Durum"
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Grade <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => updateFormData('grade', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", backgroundPosition: 'right 0.5rem center' }}
                  >
                    <option value="">Select grade</option>
                    <option value="a">Grade A</option>
                    <option value="b">Grade B</option>
                    <option value="c">Grade C</option>
                  </select>
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Harvest Date <span className="text-[#64b900]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => updateFormData('harvestDate', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Quantity & Pricing */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Quantity & Sale Details
              </h3>

              {/* Quantity Information */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-x-6">
                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Unit <span className="text-[#64b900]">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => updateFormData('unit', e.target.value as 'kg' | 'quintal' | 'ton')}
                      className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      <option value="kg">Kg</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Total Quantity <span className="text-[#64b900]">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => updateFormData('quantity', e.target.value)}
                      placeholder="Enter quantity"
                      className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px my-6 bg-black/10" />

              {/* Sale Type Toggle */}
              <div className="mb-5">
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-3 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Sale Type <span className="text-[#64b900]">*</span>
                </label>
                <div className="inline-flex bg-white rounded-[10px] p-1 shadow-lg border-2 border-black/10">
                  <button
                    type="button"
                    onClick={() => updateFormData('saleType', 'auction')}
                    className={`px-8 py-3 rounded-[10px] font-['Geologica:Regular',sans-serif] transition-all duration-200 ${
                      formData.saleType === 'auction' 
                        ? 'bg-[#64b900] text-white shadow-md' 
                        : 'text-black hover:text-black/80'
                    }`}
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Auction
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData('saleType', 'fixed')}
                    className={`px-8 py-3 rounded-[10px] font-['Geologica:Regular',sans-serif] transition-all duration-200 ${
                      formData.saleType === 'fixed' 
                        ? 'bg-[#64b900] text-white shadow-md' 
                        : 'text-black hover:text-black/80'
                    }`}
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Fixed Price
                  </button>
                </div>
              </div>

              {/* Auction Fields */}
              {formData.saleType === 'auction' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {/* Left Column - Top */}
                    <div>
                      <div className="mb-2">
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Price Per {formData.unit} <span className="text-[#64b900]">*</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) => updateFormData('pricePerUnit', e.target.value)}
                        placeholder={`₹ Enter price per ${formData.unit}`}
                        className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>

                    {/* Right Column - Top */}
                    <div>
                      <div className="mb-2">
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Auction End Date <span className="text-[#64b900]">*</span>
                        </label>
                      </div>
                      <input
                        type="datetime-local"
                        value={formData.auctionEndDate}
                        onChange={(e) => updateFormData('auctionEndDate', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        min={getAuctionDateLimits().min}
                        max={getAuctionDateLimits().max}
                      />
                    </div>

                    {/* Left Column - Bottom */}
                    <div>
                      <div className="mb-2">
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Minimum Bid Increment <span className="text-[#64b900]">*</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={formData.minimumBidIncrement}
                        onChange={(e) => updateFormData('minimumBidIncrement', e.target.value)}
                        placeholder="₹ Enter minimum bid increment"
                        className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>

                    {/* Right Column - Bottom */}
                    <div>
                      <div className="mb-2">
                        <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Maximum Bid Increment <span className="text-[#64b900]">*</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={formData.maximumBidIncrement}
                        onChange={(e) => updateFormData('maximumBidIncrement', e.target.value)}
                        placeholder="₹ Enter maximum bid increment"
                        className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      />
                    </div>
                  </div>

                  {/* Validation Error Message */}
                  {formData.minimumBidIncrement && formData.maximumBidIncrement && parseFloat(formData.maximumBidIncrement) <= parseFloat(formData.minimumBidIncrement) && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-red-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Maximum bid increment must be greater than minimum bid increment
                      </p>
                    </div>
                  )}

                  {/* Price Calculation Card */}
                  {formData.quantity && formData.pricePerUnit && (
                    <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-2xl p-5 border-2 border-[#64b900]/20 shadow-lg">
                      <div className="flex justify-center">
                        <div>
                          <div className="font-['Geologica:Regular',sans-serif] text-xs mb-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Total Base Price
                          </div>
                          <div className="font-['Geologica:Regular',sans-serif] text-2xl text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {formatCurrency(calculateTotalPrice())}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fixed Price Fields */}
              {formData.saleType === 'fixed' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Price Per {formData.unit} <span className="text-[#64b900]">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerUnit}
                      onChange={(e) => updateFormData('pricePerUnit', e.target.value)}
                      placeholder={`₹ Enter price per ${formData.unit}`}
                      className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    />
                  </div>

                  {/* Price Calculation Card */}
                  {formData.quantity && formData.pricePerUnit && (
                    <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-2xl p-5 border-2 border-[#64b900]/20 shadow-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-['Geologica:Regular',sans-serif] text-xs mb-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Price Per {formData.unit}
                          </div>
                          <div className="font-['Geologica:Regular',sans-serif] text-2xl text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {formatCurrency(parseFloat(formData.pricePerUnit))}
                          </div>
                        </div>
                        <div>
                          <div className="font-['Geologica:Regular',sans-serif] text-xs mb-1 text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Total Price
                          </div>
                          <div className="font-['Geologica:Regular',sans-serif] text-2xl text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {formatCurrency(calculateTotalPrice())}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Purchase Type */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Purchase Type
              </h3>

              {/* Purchase Type */}
              <div className="mb-6">
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-4 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  How would you like buyers to purchase your crop? <span className="text-[#64b900]">*</span>
                </label>
                
                <div className="space-y-4">
                  {/* Whole Lot Only Option */}
                  <div 
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      formData.purchaseType === 'whole' 
                        ? 'border-[#64b900] bg-[#64b900]/5' 
                        : 'border-black/10 hover:border-[#64b900]/50'
                    }`}
                    onClick={() => updateFormData('purchaseType', 'whole')}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="purchaseType"
                        value="whole"
                        checked={formData.purchaseType === 'whole'}
                        onChange={(e) => updateFormData('purchaseType', e.target.value)}
                        className="w-5 h-5 mr-4 mt-0.5"
                        style={{ accentColor: '#64b900' }}
                      />
                      <div className="flex-1">
                        <div className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Whole Lot Only
                        </div>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 leading-relaxed" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Buyers must purchase the entire quantity you're listing. This is ideal when you want to sell all your produce in a single transaction. Example: If you list 1000 kg, the buyer must buy all 1000 kg.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Partial Orders Allowed Option */}
                  <div 
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      formData.purchaseType === 'partial' 
                        ? 'border-[#64b900] bg-[#64b900]/5' 
                        : 'border-black/10 hover:border-[#64b900]/50'
                    }`}
                    onClick={() => updateFormData('purchaseType', 'partial')}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="purchaseType"
                        value="partial"
                        checked={formData.purchaseType === 'partial'}
                        onChange={(e) => updateFormData('purchaseType', e.target.value)}
                        className="w-5 h-5 mr-4 mt-0.5"
                        style={{ accentColor: '#64b900' }}
                      />
                      <div className="flex-1">
                        <div className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Partial Orders Allowed
                        </div>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 leading-relaxed mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Buyers can purchase any quantity they need, as long as it meets your minimum order quantity (MOQ). This allows multiple buyers to purchase from your listing. Example: If you list 1000 kg with MOQ of 100 kg, buyers can order 100 kg, 250 kg, 500 kg, etc.
                        </p>
                        
                        {formData.purchaseType === 'partial' && (
                          <div className="mt-4 pt-4 border-t border-black/10">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  Minimum Order Quantity (MOQ) <span className="text-[#64b900]">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={formData.moq}
                                  onChange={(e) => updateFormData('moq', e.target.value)}
                                  placeholder="Enter minimum order quantity"
                                  className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div>
                                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  Price Per {formData.unit} (MOQ) <span className="text-[#64b900]">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={formData.moqPrice}
                                  onChange={(e) => updateFormData('moqPrice', e.target.value)}
                                  placeholder={`₹ Enter price per ${formData.unit}`}
                                  className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Quality & Location */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
                Quality & Logistics
              </h3>

              {/* Quality Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Packaging Type <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.packagingType}
                    onChange={(e) => updateFormData('packagingType', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select packaging</option>
                    <option value="loose">Loose</option>
                    <option value="bags">Bags</option>
                    <option value="crates">Crates</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Storage Type
                  </label>
                  <select
                    value={formData.storageType}
                    onChange={(e) => updateFormData('storageType', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select storage type</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="cold">Cold Storage</option>
                    <option value="open">Open Storage</option>
                  </select>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    State <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select state</option>
                    <option value="punjab">Punjab</option>
                    <option value="haryana">Haryana</option>
                    <option value="up">Uttar Pradesh</option>
                    <option value="karnataka">Karnataka</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    District <span className="text-[#64b900]">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => updateFormData('district', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black focus:outline-none focus:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif]"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="">Select district</option>
                    <option value="ludhiana">Ludhiana</option>
                    <option value="amritsar">Amritsar</option>
                    <option value="patiala">Patiala</option>
                  </select>
                </div>
              </div>

              {/* Pickup Method */}
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-3 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Pickup Method <span className="text-[#64b900]">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="buyer"
                      checked={formData.pickupMethod === 'buyer'}
                      onChange={(e) => updateFormData('pickupMethod', e.target.value)}
                      className="w-4 h-4 mr-3"
                      style={{ accentColor: '#64b900' }}
                    />
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Buyer Pickup</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="seller"
                      checked={formData.pickupMethod === 'seller'}
                      onChange={(e) => updateFormData('pickupMethod', e.target.value)}
                      className="w-4 h-4 mr-3"
                      style={{ accentColor: '#64b900' }}
                    />
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller Delivery</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="negotiable"
                      checked={formData.pickupMethod === 'negotiable'}
                      onChange={(e) => updateFormData('pickupMethod', e.target.value)}
                      className="w-4 h-4 mr-3"
                      style={{ accentColor: '#64b900' }}
                    />
                    <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Transport Negotiable</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media & Review */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Media & Additional Details
              </h3>

              {/* Image Upload */}
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Product Images
                </label>
                <div 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="border-2 border-dashed border-black/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[#64b900] hover:bg-[#64b900]/5 transition-all"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-black/40" />
                  <p className="font-['Geologica:Regular',sans-serif] mb-1 text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Drag & Drop Images Here
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm mb-3 text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    or click to browse
                  </p>
                  <button
                    type="button"
                    className="px-6 py-2 border-2 border-[#64b900] rounded-lg font-['Geologica:Regular',sans-serif] font-medium transition-colors hover:bg-[#64b900] hover:text-white bg-white text-black"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Choose Files
                  </button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
                    }}
                    className="hidden"
                  />
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-6 gap-3 mt-3">
                  {formData.images.map((file, i) => (
                    <div
                      key={i}
                      className="aspect-square border-2 border-[#64b900]/30 rounded-lg flex items-center justify-center bg-white relative overflow-hidden group"
                    >
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, idx) => idx !== i)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 6 - formData.images.length))].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square border-2 border-black/10 rounded-lg flex items-center justify-center bg-white"
                    >
                      <Package className="w-6 h-6 text-black/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Upload */}
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Upload Quality Certificate (Optional)
                </label>
                <div 
                  onClick={() => document.getElementById('certificate-upload')?.click()}
                  className="border-2 border-dashed border-black/20 rounded-2xl p-4 text-center cursor-pointer hover:border-[#64b900] hover:bg-[#64b900]/5 transition-all"
                >
                  {formData.certificate ? (
                    <div className="flex items-center justify-center gap-2 text-[#64b900]">
                      <FileText className="w-5 h-5" />
                      <span className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {formData.certificate.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, certificate: null }));
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-2 text-black/40" />
                      <p className="font-['Geologica:Regular',sans-serif] text-sm mb-2 text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        PDF or Image files accepted
                      </p>
                      <button
                        type="button"
                        className="px-4 py-1.5 border-2 border-[#64b900] rounded-lg text-sm font-['Geologica:Regular',sans-serif] font-medium transition-colors hover:bg-[#64b900] hover:text-white bg-white text-black"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      >
                        Choose File
                      </button>
                    </>
                  )}
                  <input
                    id="certificate-upload"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, certificate: file }));
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium mb-2 text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  placeholder="Mention storage condition, certification, or additional notes..."
                  className="w-full px-4 py-2.5 border-2 border-black/10 rounded-lg bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-[#64b900] transition-colors resize-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              {/* Listing Preview Card */}
              <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-2xl border-2 border-[#64b900]/20 p-5 shadow-lg">
                <h4 className="font-['Fraunces',sans-serif] text-xl mb-3 text-black">
                  Listing Preview
                </h4>

                <div className="grid grid-cols-3 gap-6">
                  {/* Image Preview */}
                  <div className="aspect-square border-2 border-black/10 rounded-lg flex items-center justify-center bg-white">
                    <Package className="w-16 h-16 text-black/20" />
                  </div>

                  {/* Details */}
                  <div className="col-span-2">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {formData.cropName ? 
                          `${formData.cropName.charAt(0).toUpperCase() + formData.cropName.slice(1)}${formData.variety ? ` - ${formData.variety}` : ''}` 
                          : 'Crop Name - Variety'
                        }
                      </h5>
                      <span 
                        className={`px-3 py-1 text-xs rounded-lg font-['Geologica:Regular',sans-serif]`}
                        style={{
                          fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                          backgroundColor: '#64b90020',
                          color: '#64b900',
                          border: '1px solid #64b90040'
                        }}
                      >
                        {formData.purchaseType === 'partial' ? 'Partial' : 'Whole Lot'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex">
                        <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Quantity:</span>
                        <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formData.quantity ? `${formData.quantity} ${formData.unit}` : '--- kg'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Sale Type:</span>
                        <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formData.saleType === 'auction' ? 'Auction' : 'Fixed Price'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Price (Total):</span>
                        <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formData.quantity && formData.pricePerUnit ? 
                            formatCurrency(calculateTotalPrice()) : 
                            '₹---'
                          }
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Per {formData.unit}:</span>
                        <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formData.pricePerUnit ? 
                            formatCurrency(parseFloat(formData.pricePerUnit)) : 
                            '₹---'
                          }
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location:</span>
                        <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {formData.district && formData.state ? 
                            `${formData.district.charAt(0).toUpperCase() + formData.district.slice(1)}, ${formData.state.charAt(0).toUpperCase() + formData.state.slice(1)}` : 
                            '---, ---'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Partial Orders Details */}
                    {formData.purchaseType === 'partial' && (
                      <div className="mt-3 pt-3 border-t border-black/10">
                        <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold mb-2 text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Partial Orders Details:
                        </p>
                        <div className="ml-3 space-y-1 text-xs">
                          <p className="font-['Geologica:Regular',sans-serif] italic text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Note: Sale type is Fixed Price for partial orders
                          </p>
                          {formData.moq && (
                            <>
                              <div className="flex">
                                <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>MOQ:</span>
                                <span className="ml-2 font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  {formData.moq} {formData.unit}
                                </span>
                              </div>
                              {formData.moqPrice && (
                                <>
                                  <div className="flex">
                                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Price per {formData.unit} (for MOQ):</span>
                                    <span className="ml-2 font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                      {formatCurrency(parseFloat(formData.moqPrice))}
                                    </span>
                                  </div>
                                  <div className="flex">
                                    <span className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Total for MOQ:</span>
                                    <span className="ml-2 font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                      {formatCurrency(calculateMoqTotal())}
                                    </span>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t-2 border-black/10 flex items-center justify-between bg-white rounded-b-2xl">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 bg-white text-black"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep === 5 ? (
            <button
              onClick={handlePublish}
              disabled={!isStepValid()}
              className="px-8 py-2.5 rounded-[10px] font-['Geologica:Regular',sans-serif] font-medium transition-all bg-[#64b900] text-white hover:bg-[#559900] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#64b900]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Publish Listing
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-2.5 rounded-[10px] font-['Geologica:Regular',sans-serif] font-medium transition-all bg-[#64b900] text-white hover:bg-[#559900] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#64b900]"
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