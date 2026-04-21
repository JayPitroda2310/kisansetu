import { useState, useEffect } from 'react';
import { X, Package, Calendar, IndianRupee, Percent, MapPin, Truck, FileText, Save } from 'lucide-react';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
  listing: {
    id: string;
    cropName: string;
    variety: string;
    grade: string;
    harvestDate: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
    location: { district: string; state: string; pincode: string };
    packagingType: string;
    storageType: string;
    pickupMethod: string;
    description: string;
    saleType: 'auction' | 'fixed';
    orderType: 'whole' | 'partial';
    moq?: number;
    moqPrice?: number;
    minimumBidIncrement?: number;
  };
}

export function EditListingModal({ isOpen, onClose, onSave, listing }: EditListingModalProps) {
  const [formData, setFormData] = useState({
    grade: listing.grade,
    quantity: listing.quantity,
    pricePerUnit: listing.pricePerUnit,
    totalPrice: listing.totalPrice,
    district: listing.location.district,
    state: listing.location.state,
    pincode: listing.location.pincode,
    packagingType: listing.packagingType,
    storageType: listing.storageType,
    pickupMethod: listing.pickupMethod,
    description: listing.description,
    moq: listing.moq || 0,
    moqPrice: listing.moqPrice || 0,
    minimumBidIncrement: listing.minimumBidIncrement || 0
  });

  useEffect(() => {
    // Recalculate total price when quantity or price per unit changes
    setFormData(prev => ({
      ...prev,
      totalPrice: prev.quantity * prev.pricePerUnit
    }));
  }, [formData.quantity, formData.pricePerUnit]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({
      ...listing,
      ...formData,
      location: {
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      }
    });
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border-2 border-black/10 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-black/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#64b900]/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Edit Listing
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {listing.cropName} - {listing.variety}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Product Details Section */}
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Crop Name (Read-only) */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Crop Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {listing.cropName}
                  </div>
                </div>

                {/* Variety (Read-only) */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Variety
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {listing.variety}
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Quantity ({listing.unit})
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Packaging Type */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Packaging Type
                  </label>
                  <select
                    value={formData.packagingType}
                    onChange={(e) => handleChange('packagingType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="Jute Bags">Jute Bags</option>
                    <option value="Plastic Bags">Plastic Bags</option>
                    <option value="Gunny Bags">Gunny Bags</option>
                    <option value="Loose">Loose</option>
                  </select>
                </div>

                {/* Storage Type */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Storage Type
                  </label>
                  <select
                    value={formData.storageType}
                    onChange={(e) => handleChange('storageType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Dry Warehouse">Dry Warehouse</option>
                    <option value="Farm Storage">Farm Storage</option>
                    <option value="Open Air">Open Air</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Price per Unit */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Price per {listing.unit}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <IndianRupee className="w-4 h-4 text-black/40" />
                    </div>
                    <input
                      type="number"
                      value={formData.pricePerUnit}
                      onChange={(e) => handleChange('pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Total Price (Auto-calculated) */}
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Total Price
                  </label>
                  <div className="px-4 py-3 bg-[#64b900]/10 border-2 border-[#64b900]/30 rounded-lg font-['Geologica:Regular',sans-serif] text-sm text-[#64b900] font-semibold" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {formatCurrency(formData.totalPrice)}
                  </div>
                </div>

                {/* Minimum Bid Increment (for auctions) */}
                {listing.saleType === 'auction' && (
                  <div>
                    <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      Minimum Bid Increment
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <IndianRupee className="w-4 h-4 text-black/40" />
                      </div>
                      <input
                        type="number"
                        value={formData.minimumBidIncrement}
                        onChange={(e) => handleChange('minimumBidIncrement', parseFloat(e.target.value) || 0)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>
                )}

                {/* MOQ (for partial orders) */}
                {listing.orderType === 'partial' && (
                  <>
                    <div>
                      <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Minimum Order Quantity ({listing.unit})
                      </label>
                      <input
                        type="number"
                        value={formData.moq}
                        onChange={(e) => handleChange('moq', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Price per {listing.unit} (for MOQ)
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <IndianRupee className="w-4 h-4 text-black/40" />
                        </div>
                        <input
                          type="number"
                          value={formData.moqPrice}
                          onChange={(e) => handleChange('moqPrice', parseFloat(e.target.value) || 0)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Location & Logistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  />
                </div>

                <div>
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    maxLength={6}
                  />
                </div>

                <div className="col-span-3">
                  <label className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Pickup Method
                  </label>
                  <select
                    value={formData.pickupMethod}
                    onChange={(e) => handleChange('pickupMethod', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none"
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    <option value="buyer">Buyer Pickup</option>
                    <option value="seller">Seller Delivery</option>
                    <option value="negotiable">Transport Negotiable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">
                Description
              </h3>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black/10 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:border-[#64b900] focus:outline-none resize-none"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                rows={4}
                placeholder="Describe your product..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-black/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-black/10 text-black rounded-lg hover:bg-black/5 transition-colors font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#558a00] transition-colors font-['Geologica:Regular',sans-serif] shadow-md flex items-center gap-2"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
