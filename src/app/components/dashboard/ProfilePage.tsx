import { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  MapPin,
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import profileAvatar from 'figma:asset/fa2ac1034278e0bb33243ca36a48e788d9e706b9.png';
import { getUserProfile, updateUserProfile, calculateProfileCompletion } from '../../utils/supabase/profiles';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../utils/supabase/client';

type UserRole = 'farmer' | 'buyer' | 'service-provider' | 'both';

interface ProfilePageProps {
  userRole?: UserRole;
  isCompletionMode?: boolean;
  onComplete?: () => void;
  initialData?: any;
}

export function ProfilePage({ userRole = 'farmer', isCompletionMode = false, onComplete, initialData }: ProfilePageProps) {
  const [editingBasicInfo, setEditingBasicInfo] = useState(isCompletionMode);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [editingDetails, setEditingDetails] = useState(isCompletionMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    fullName: initialData?.fullName || '',
    mobile: initialData?.phone || '',
    email: initialData?.email || '',
    dob: '',
    gender: ''
  });

  const [financialInfo, setFinancialInfo] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [farmerDetails, setFarmerDetails] = useState({
    farmSize: '',
    primaryCrops: '',
    farmLocation: '',
    experience: ''
  });

  const [businessDetails, setBusinessDetails] = useState({
    companyName: '',
    gstNumber: '',
    businessAddress: '',
    businessType: 'trader'
  });

  const [addressInfo, setAddressInfo] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [documentInfo, setDocumentInfo] = useState({
    aadharNumber: '',
    panNumber: ''
  });

  // Load profile data from Supabase
  useEffect(() => {
    loadProfileData();
  }, []);

  // Calculate completion percentage whenever data changes
  useEffect(() => {
    const profileData = {
      full_name: basicInfo.fullName,
      phone: basicInfo.mobile,
      role: userRole,
      location: addressInfo.address,
      state: addressInfo.state,
      pincode: addressInfo.pincode,
      farm_size: farmerDetails.farmSize ? parseFloat(farmerDetails.farmSize) : undefined,
      primary_crops: farmerDetails.primaryCrops ? farmerDetails.primaryCrops.split(',').map(c => c.trim()) : [],
      farming_experience: farmerDetails.experience ? parseInt(farmerDetails.experience) : undefined,
      business_name: businessDetails.companyName,
      business_type: businessDetails.businessType,
      gst_number: businessDetails.gstNumber,
      bank_name: financialInfo.bankName,
      account_number: financialInfo.accountNumber,
      ifsc_code: financialInfo.ifscCode,
      upi_id: financialInfo.upiId,
      aadhar_number: documentInfo.aadharNumber,
      pan_number: documentInfo.panNumber,
      profile_completed: false
    };
    const percentage = calculateProfileCompletion(profileData);
    setCompletionPercentage(percentage);
  }, [basicInfo, financialInfo, farmerDetails, businessDetails, addressInfo, documentInfo, userRole]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load email from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || '';
      
      const { data, error } = await getUserProfile();
      
      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
        return;
      }

      if (data) {
        // Populate form fields with existing data
        setBasicInfo({
          fullName: data.full_name || '',
          mobile: data.phone || '',
          email: userEmail, // Load email from Auth, not from profile
          dob: data.date_of_birth || '',
          gender: data.gender || ''
        });

        setAddressInfo({
          address: data.location || '', // Map location -> address
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || ''
        });

        setFinancialInfo({
          bankName: data.bank_name || '',
          accountNumber: data.account_number || '',
          ifscCode: data.ifsc_code || '',
          upiId: data.upi_id || ''
        });

        setFarmerDetails({
          farmSize: data.farm_size?.toString() || '',
          primaryCrops: Array.isArray(data.primary_crops) ? data.primary_crops.join(', ') : '',
          farmLocation: data.farm_location || '',
          experience: data.farming_experience?.toString() || ''
        });

        setBusinessDetails({
          companyName: data.business_name || '',
          gstNumber: data.gst_number || '',
          businessAddress: data.location || '',
          businessType: data.business_type || 'trader'
        });

        setDocumentInfo({
          aadharNumber: data.aadhar_number || '',
          panNumber: data.pan_number || ''
        });

        // Load profile photo
        setProfilePhotoUrl(data.avatar_url || null);

        console.log('✅ Profile loaded successfully with email:', userEmail);
      }
    } catch (error) {
      console.error('Error in loadProfileData:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    console.log('💾 === SAVE CHANGES CLICKED (Profile Page) ===');
    console.log('📋 Current form state:', {
      basicInfo,
      financialInfo,
      farmerDetails,
      businessDetails,
      addressInfo,
      documentInfo
    });
    
    try {
      setSaving(true);

      // Prepare profile data for update - NOW INCLUDING ALL FIELDS
      const profileData: any = {};

      // BASIC INFORMATION
      if (basicInfo.fullName && basicInfo.fullName.trim()) {
        profileData.full_name = basicInfo.fullName.trim();
      }
      if (basicInfo.mobile && basicInfo.mobile.trim()) {
        profileData.phone = basicInfo.mobile.trim();
      }
      if (basicInfo.dob && basicInfo.dob.trim()) {
        profileData.date_of_birth = basicInfo.dob.trim();
      }
      if (basicInfo.gender && basicInfo.gender.trim()) {
        profileData.gender = basicInfo.gender.trim();
      }

      // ADDRESS INFORMATION
      if (addressInfo.address && addressInfo.address.trim()) {
        profileData.location = addressInfo.address.trim(); // Map address -> location
      }
      if (addressInfo.city && addressInfo.city.trim()) {
        profileData.city = addressInfo.city.trim();
      }
      if (addressInfo.state && addressInfo.state.trim()) {
        profileData.state = addressInfo.state.trim();
      }
      if (addressInfo.pincode && addressInfo.pincode.trim()) {
        profileData.pincode = addressInfo.pincode.trim();
      }

      // FINANCIAL INFORMATION
      if (financialInfo.bankName && financialInfo.bankName.trim()) {
        profileData.bank_name = financialInfo.bankName.trim();
      }
      if (financialInfo.accountNumber && financialInfo.accountNumber.trim()) {
        profileData.account_number = financialInfo.accountNumber.trim();
      }
      if (financialInfo.ifscCode && financialInfo.ifscCode.trim()) {
        profileData.ifsc_code = financialInfo.ifscCode.trim();
      }
      if (financialInfo.upiId && financialInfo.upiId.trim()) {
        profileData.upi_id = financialInfo.upiId.trim();
      }

      // DOCUMENT INFORMATION
      if (documentInfo.aadharNumber && documentInfo.aadharNumber.trim()) {
        profileData.aadhar_number = documentInfo.aadharNumber.trim();
      }
      if (documentInfo.panNumber && documentInfo.panNumber.trim()) {
        profileData.pan_number = documentInfo.panNumber.trim();
      }

      // FARMER DETAILS (role-specific)
      if (userRole === 'farmer' || userRole === 'both') {
        if (farmerDetails.farmSize && farmerDetails.farmSize.trim()) {
          profileData.farm_size = parseFloat(farmerDetails.farmSize);
        }
        if (farmerDetails.primaryCrops && farmerDetails.primaryCrops.trim()) {
          profileData.primary_crops = farmerDetails.primaryCrops.split(',').map(c => c.trim()).filter(c => c);
        }
        if (farmerDetails.farmLocation && farmerDetails.farmLocation.trim()) {
          profileData.farm_location = farmerDetails.farmLocation.trim();
        }
        if (farmerDetails.experience && farmerDetails.experience.trim()) {
          profileData.farming_experience = parseInt(farmerDetails.experience);
        }
      }

      // BUSINESS DETAILS (role-specific)
      if (userRole === 'buyer' || userRole === 'both') {
        if (businessDetails.companyName && businessDetails.companyName.trim()) {
          profileData.business_name = businessDetails.companyName.trim();
        }
        if (businessDetails.gstNumber && businessDetails.gstNumber.trim()) {
          profileData.gst_number = businessDetails.gstNumber.trim();
        }
        if (businessDetails.businessType && businessDetails.businessType.trim()) {
          profileData.business_type = businessDetails.businessType.trim();
        }
      }

      // Validate required fields in completion mode
      if (isCompletionMode) {
        const isBasicInfoComplete = basicInfo.fullName && basicInfo.mobile;
        const isAddressComplete = addressInfo.address && addressInfo.state && addressInfo.pincode;
        
        let isDetailsComplete = true;
        if (userRole === 'farmer' || userRole === 'both') {
          isDetailsComplete = !!(farmerDetails.farmSize && farmerDetails.primaryCrops);
        }
        if (userRole === 'buyer' || userRole === 'both') {
          isDetailsComplete = isDetailsComplete && !!(businessDetails.companyName);
        }

        if (!isBasicInfoComplete || !isAddressComplete || !isDetailsComplete) {
          toast.error('Please fill in all required fields to complete your profile.');
          setSaving(false);
          return;
        }
      }

      // Only update if there are fields to update
      if (Object.keys(profileData).length === 0) {
        toast.info('No changes to save.');
        setSaving(false);
        return;
      }

      console.log('📤 Sending ALL profile fields to Supabase:', profileData);

      // Update profile in Supabase
      const { data, error } = await updateUserProfile(profileData);

      if (error) {
        console.error('❌ Error updating profile:', error);
        toast.error('Failed to save profile: ' + (error.message || 'Unknown error'));
        return;
      }

      console.log('✅ Profile saved successfully!', data);
      toast.success('Profile saved successfully!');
      
      // Update the completion percentage from the response
      if (data) {
        const percentage = calculateProfileCompletion(data);
        setCompletionPercentage(percentage);
        
        // If profile is completed and we're in completion mode, call onComplete
        if (isCompletionMode && data.profile_completed) {
          setTimeout(() => {
            onComplete?.();
          }, 500);
        }
      }

      // Turn off editing modes
      setEditingBasicInfo(false);
      setEditingFinancial(false);
      setEditingDetails(false);

    } catch (error) {
      console.error('❌ Exception in handleSaveChanges:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('📸 Starting profile photo upload...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload a photo');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('📤 Uploading to:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        toast.error('Failed to upload photo: ' + uploadError.message);
        return;
      }

      console.log('✅ Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrl);

      // Update profile with new avatar URL
      const { data: profileData, error: updateError } = await updateUserProfile({
        avatar_url: publicUrl
      });

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        toast.error('Failed to update profile photo');
        return;
      }

      // Update local state
      setProfilePhotoUrl(publicUrl);
      console.log('✅ Profile photo updated successfully!');
      toast.success('Profile photo updated successfully!');

    } catch (error) {
      console.error('❌ Exception in handlePhotoUpload:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#64b900] animate-spin" />
          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Render in full-page mode when in completion mode
  const content = (
    <div className="space-y-6">
      {/* Completion Mode Banner */}
      {isCompletionMode && (
        <div className="bg-gradient-to-r from-[#64b900] to-[#559900] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl mb-2">
                Complete Your Profile
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-white/90" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Please fill in all required information to access your dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">{completionPercentage}%</div>
              <div className="text-sm text-white/80">Complete</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={profilePhotoUrl || profileAvatar} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-black/10"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-['Geologica:Regular',sans-serif] text-xl text-black mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {basicInfo.fullName || 'Jay Pitroda'}
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {userRole === 'farmer' ? 'Farmer' : userRole === 'buyer' ? 'Buyer' : 'Service Provider'}
            </p>
            <input
              type="file"
              id="profile-photo-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <label
              htmlFor="profile-photo-upload"
              className="inline-block px-4 py-2 border-2 border-[#64b900] text-[#64b900] rounded-[10px] hover:bg-[#64b900] hover:text-white transition-colors text-sm font-['Geologica:Regular',sans-serif] cursor-pointer"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              <User className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Basic Information
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Personal details and contact info
              </p>
            </div>
          </div>
          {editingBasicInfo ? (
            <button 
              onClick={() => setEditingBasicInfo(false)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-6 h-6 text-[#64b900]" />
            </button>
          ) : (
            <button 
              onClick={() => setEditingBasicInfo(true)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-6 h-6 text-[#64b900]" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Full Name
            </label>
            <input
              type="text"
              value={basicInfo.fullName}
              onChange={(e) => setBasicInfo({ ...basicInfo, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingBasicInfo}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Mobile Number
            </label>
            <input
              type="tel"
              value={basicInfo.mobile}
              onChange={(e) => setBasicInfo({ ...basicInfo, mobile: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingBasicInfo}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Email Address
            </label>
            <input
              type="email"
              value={basicInfo.email}
              onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingBasicInfo}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={basicInfo.dob}
              onChange={(e) => setBasicInfo({ ...basicInfo, dob: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingBasicInfo}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Gender
            </label>
            <select
              value={basicInfo.gender}
              onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              disabled={!editingBasicInfo}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              <CreditCard className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Financial Information
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Bank and payment details
              </p>
            </div>
          </div>
          {editingFinancial ? (
            <button 
              onClick={() => setEditingFinancial(false)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-6 h-6 text-[#64b900]" />
            </button>
          ) : (
            <button 
              onClick={() => setEditingFinancial(true)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-6 h-6 text-[#64b900]" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Bank Name
            </label>
            <input
              type="text"
              value={financialInfo.bankName}
              onChange={(e) => setFinancialInfo({ ...financialInfo, bankName: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingFinancial}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Account Number
            </label>
            <input
              type="text"
              value={financialInfo.accountNumber}
              onChange={(e) => setFinancialInfo({ ...financialInfo, accountNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingFinancial}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              IFSC Code
            </label>
            <input
              type="text"
              value={financialInfo.ifscCode}
              onChange={(e) => setFinancialInfo({ ...financialInfo, ifscCode: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingFinancial}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              UPI ID
            </label>
            <input
              type="text"
              value={financialInfo.upiId}
              onChange={(e) => setFinancialInfo({ ...financialInfo, upiId: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingFinancial}
            />
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              <ShieldCheck className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Verification Status
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Document verification and KYC
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#64b900]/5 rounded-[10px] border border-[#64b900]/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#64b900]" />
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Mobile Number Verified
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Verified on Feb 20, 2026
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#64b900] text-white text-xs rounded-lg font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[10px] border border-black/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Aadhaar Verification
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Complete Aadhaar verification for higher limits
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#64b900] text-white rounded-[10px] hover:bg-[#559900] transition-colors text-sm font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Verify Now
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[10px] border border-black/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Bank Account Verification
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Required for receiving payments
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#64b900] text-white rounded-[10px] hover:bg-[#559900] transition-colors text-sm font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Verify Now
            </button>
          </div>
        </div>
      </div>

      {/* Farm Details (for farmers/sellers) or Business Details (for buyers) */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              {userRole === 'farmer' ? (
                <MapPin className="w-6 h-6 text-[#64b900]" />
              ) : (
                <Building2 className="w-6 h-6 text-[#64b900]" />
              )}
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                {userRole === 'farmer' ? 'Farm Details' : 'Business Details'}
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {userRole === 'farmer' ? 'Information about your farm' : 'Company and business information'}
              </p>
            </div>
          </div>
          {editingDetails ? (
            <button 
              onClick={() => setEditingDetails(false)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-6 h-6 text-[#64b900]" />
            </button>
          ) : (
            <button 
              onClick={() => setEditingDetails(true)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-6 h-6 text-[#64b900]" />
            </button>
          )}
        </div>

        {userRole === 'farmer' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Farm Size (in acres)
              </label>
              <input
                type="number"
                value={farmerDetails.farmSize}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, farmSize: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Primary Crops
              </label>
              <input
                type="text"
                value={farmerDetails.primaryCrops}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, primaryCrops: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Farm Location
              </label>
              <input
                type="text"
                value={farmerDetails.farmLocation}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, farmLocation: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Years of Experience
              </label>
              <input
                type="number"
                value={farmerDetails.experience}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Company Name
              </label>
              <input
                type="text"
                value={businessDetails.companyName}
                onChange={(e) => setBusinessDetails({ ...businessDetails, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                GST Number
              </label>
              <input
                type="text"
                value={businessDetails.gstNumber}
                onChange={(e) => setBusinessDetails({ ...businessDetails, gstNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Business Address
              </label>
              <input
                type="text"
                value={businessDetails.businessAddress}
                onChange={(e) => setBusinessDetails({ ...businessDetails, businessAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                readOnly={!editingDetails}
              />
            </div>
            <div>
              <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Business Type
              </label>
              <select
                value={businessDetails.businessType}
                onChange={(e) => setBusinessDetails({ ...businessDetails, businessType: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                disabled={!editingDetails}
              >
                <option value="trader">Trader</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              <MapPin className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Address Information
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Your residential or business address
              </p>
            </div>
          </div>
          {editingDetails ? (
            <button 
              onClick={() => setEditingDetails(false)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-6 h-6 text-[#64b900]" />
            </button>
          ) : (
            <button 
              onClick={() => setEditingDetails(true)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-6 h-6 text-[#64b900]" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Address
            </label>
            <input
              type="text"
              value={addressInfo.address}
              onChange={(e) => setAddressInfo({ ...addressInfo, address: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              City
            </label>
            <input
              type="text"
              value={addressInfo.city}
              onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              State
            </label>
            <input
              type="text"
              value={addressInfo.state}
              onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Pincode
            </label>
            <input
              type="text"
              value={addressInfo.pincode}
              onChange={(e) => setAddressInfo({ ...addressInfo, pincode: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#64b900]/10 rounded-[10px]">
              <ShieldCheck className="w-6 h-6 text-[#64b900]" />
            </div>
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-2xl text-black">
                Document Information
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Upload your documents for verification
              </p>
            </div>
          </div>
          {editingDetails ? (
            <button 
              onClick={() => setEditingDetails(false)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-6 h-6 text-[#64b900]" />
            </button>
          ) : (
            <button 
              onClick={() => setEditingDetails(true)}
              className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-6 h-6 text-[#64b900]" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Aadhar Number
            </label>
            <input
              type="text"
              value={documentInfo.aadharNumber}
              onChange={(e) => setDocumentInfo({ ...documentInfo, aadharNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              PAN Number
            </label>
            <input
              type="text"
              value={documentInfo.panNumber}
              onChange={(e) => setDocumentInfo({ ...documentInfo, panNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              readOnly={!editingDetails}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 border-2 border-black/10 text-black rounded-[10px] hover:bg-black/5 transition-colors font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Cancel
        </button>
        <button className="px-8 py-3 bg-[#64b900] text-white rounded-[10px] hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] shadow-lg" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }} onClick={handleSaveChanges}>
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );

  // Wrap in full-screen container when in completion mode
  if (isCompletionMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefaf0] to-[#f5f0e8] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="font-['Fraunces',sans-serif] text-4xl text-black mb-2">
              Welcome to <span className="text-[#64b900]">KisanSetu</span>
            </h1>
            <p className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Complete your profile to start using the platform
            </p>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
}