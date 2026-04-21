import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Shield, 
  CreditCard, 
  FileCheck, 
  Globe, 
  Package, 
  FileText, 
  Flag, 
  Database,
  Camera,
  Check,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { StorageDiagnostic } from '../StorageDiagnostic';
import { AutoStorageSetup } from '../AutoStorageSetup';
import { StorageSetupGuide } from '../StorageSetupGuide';
import { toast } from 'sonner@2.0.3';
import { getUserProfile, updateUserProfile, UserProfileData } from '../../utils/supabase/profiles';
import { supabase } from '../../utils/supabase/client';
import profileAvatar from 'figma:asset/fa2ac1034278e0bb33243ca36a48e788d9e706b9.png';

type SettingsTab = 'account' | 'security' | 'payment' | 'kyc' | 'language' | 'shipping' | 'terms' | 'fraud' | 'storage';

interface SettingsMenuItem {
  id: SettingsTab;
  label: string;
  icon: any;
}

const settingsMenuItems: SettingsMenuItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'payment', label: 'Payment & Billing', icon: CreditCard },
  { id: 'kyc', label: 'KYC Verification', icon: FileCheck },
  { id: 'language', label: 'Change Language', icon: Globe },
  { id: 'shipping', label: 'Return & Shipping', icon: Package },
  { id: 'terms', label: 'Terms & Policies', icon: FileText },
  { id: 'fraud', label: 'Report Fraud', icon: Flag },
  { id: 'storage', label: 'Storage Diagnostics', icon: Database },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount AND when returning to account tab
  useEffect(() => {
    loadProfileData();
  }, []);

  // Reload profile when switching to account tab
  useEffect(() => {
    if (activeTab === 'account') {
      loadProfileData();
    }
  }, [activeTab]);

  const loadProfileData = async () => {
    setIsLoading(true);
    console.log('Loading profile data...');
    const { data, error } = await getUserProfile();
    if (data) {
      console.log('Profile loaded:', data);
      setProfileData(data);
    } else if (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data: ' + (error.message || 'Unknown error'));
    }
    setIsLoading(false);
  };

  const handleProfileUpdate = async (updates: Partial<UserProfileData>) => {
    console.log('🔄 handleProfileUpdate called with:', updates);
    
    try {
      // First verify user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Auth error:', authError);
        toast.error('Not authenticated. Please log in again.');
        return;
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Call the update function
      console.log('📤 Calling updateUserProfile...');
      const { data, error } = await updateUserProfile(updates);
      
      if (error) {
        console.error('❌ Update error:', error);
        toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
        return;
      }
      
      if (data) {
        console.log('✅ Profile update successful:', data);
        setProfileData(data);
        
        // Trigger a profile refresh event for other components
        window.dispatchEvent(new Event('profile-updated'));
        
        // Don't show duplicate success toast here, let the component handle it
      } else {
        console.warn('⚠️ No data returned from update');
        toast.error('Update completed but no data returned');
      }
    } catch (error: any) {
      console.error('❌ Exception in handleProfileUpdate:', error);
      toast.error('An error occurred: ' + (error.message || 'Unknown error'));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings profileData={profileData} onProfileUpdate={handleProfileUpdate} />;
      case 'security':
        return <SecuritySettings />;
      case 'payment':
        return <PaymentSettings />;
      case 'kyc':
        return <KYCSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'shipping':
        return <ShippingSettings />;
      case 'terms':
        return <TermsSettings />;
      case 'fraud':
        return <FraudSettings />;
      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-['Fraunces:SemiBold',serif] text-2xl text-gray-900 mb-2">
                Storage Diagnostics
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Diagnose and fix file upload issues
              </p>
            </div>

            {/* Critical Warning */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Database className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-['Geologica:SemiBold',sans-serif] text-base text-red-900 mb-2">
                    ⚠️ Files Not Accessible
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-red-800 mb-3">
                    Your storage bucket exists but is <strong>NOT PUBLIC</strong>. Files upload successfully but users cannot access them.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-red-300">
                    <p className="font-['Geologica:SemiBold',sans-serif] text-sm text-red-900 mb-2">
                      ✅ Quick Fix (2 minutes):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-red-800 font-['Geologica:Regular',sans-serif]">
                      <li>Go to Supabase Dashboard → Storage → Buckets</li>
                      <li>Find "message-attachments" bucket</li>
                      <li>Click ⋮ (three dots) → Configuration</li>
                      <li><strong>Toggle ON "Public bucket"</strong></li>
                      <li>Save changes</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Setup */}
            <AutoStorageSetup />
            
            {/* Manual Setup Guide */}
            <StorageSetupGuide />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <nav className="space-y-1">
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 font-['Geologica:Regular',sans-serif] text-sm
                        ${isActive 
                          ? 'bg-[#64b900] text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Dropdown */}
          <div className="lg:hidden">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
              <SelectTrigger className="w-full bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccountSettingsProps {
  profileData: UserProfileData | null;
  onProfileUpdate: (updates: Partial<UserProfileData>) => void;
}

function AccountSettings({ profileData, onProfileUpdate }: AccountSettingsProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    avatar_url: null as string | null,
    email: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    };
    loadUserEmail();
  }, []);

  // Update formData when profileData changes - THIS IS CRITICAL FOR PERSISTENCE
  useEffect(() => {
    if (profileData) {
      console.log('📥 Loading profile data into form:', profileData);
      setFormData(prev => ({
        ...prev,
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        avatar_url: profileData.avatar_url || null
      }));
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Field "${field}" changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('📸 Uploading profile photo to:', filePath);

      const { error: uploadError } = await supabase.storage
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

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', urlData.publicUrl);

      setFormData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      
      await onProfileUpdate({ avatar_url: urlData.publicUrl });
      
      console.log('✅ Profile photo updated successfully!');
      toast.success('Profile photo updated!');
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);
      toast.error('Failed to upload photo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    // Double confirmation for safety
    const confirmText = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    setIsDeleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      console.log('🗑️ Deleting account for user:', user.id);

      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Error deleting profile:', profileError);
        toast.error('Failed to delete profile data');
        return;
      }

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('❌ Error signing out:', signOutError);
        toast.error('Account data deleted but sign out failed');
        return;
      }

      console.log('✅ Account deleted successfully');
      toast.success('Your account has been deleted successfully');

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      console.error('❌ Exception in handleDeleteAccount:', error);
      toast.error('Failed to delete account: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveChanges = async () => {
    console.log('💾 === SAVE CHANGES CLICKED ===');
    console.log('📋 Form Data:', formData);
    console.log('🗄️ Current Profile Data:', profileData);
    
    if (!formData.full_name || formData.full_name.trim() === '') {
      toast.error('Please enter your full name');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const updates = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        location: formData.location
      };
      
      console.log('📤 Sending updates to database:', updates);
      
      await onProfileUpdate(updates);
      
      console.log('✅ Profile saved successfully!');
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-6">Account Settings</h2>
        
        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-gray-200">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <ImageWithFallback 
              src={formData.avatar_url || profileAvatar}
              alt="Profile" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-[#64b900] p-1.5 rounded-full border-2 border-white hover:bg-[#559900] transition-colors disabled:opacity-50"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{formData.full_name || 'Your Name'}</h3>
              <p className="text-sm text-gray-600">{formData.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#64b900]">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields - All Read-Only */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="fullName"
            value={formData.full_name}
            readOnly
            disabled
            className="border-gray-300 bg-gray-50 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="border-gray-300 bg-gray-50 pr-20 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#64b900]">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone Number
          </Label>
          <Input
            id="phone"
            value={formData.phone || 'Not provided'}
            readOnly
            disabled
            className="border-gray-300 bg-gray-50 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
            Location
          </Label>
          <Input
            id="location"
            value={formData.location || 'Not provided'}
            readOnly
            disabled
            className="border-gray-300 bg-gray-50 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Delete Account Button Only */}
      <div className="flex justify-start pt-6 border-t border-gray-200">
        <Button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
              Deleting...
            </>
          ) : (
            'Delete Account'
          )}
        </Button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Security</h2>
        <p className="text-sm text-gray-600">Manage your password and security preferences</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
            Current Password
          </Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Enter current password"
            className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            New Password
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Include at least one uppercase letter</li>
            <li>• Include at least one number</li>
            <li>• Include at least one special character</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-8">
          Update Password
        </Button>
      </div>
    </div>
  );
}

function PaymentSettings() {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load saved payment details on mount
  useEffect(() => {
    const loadPaymentData = async () => {
      const { data } = await getUserProfile();
      if (data) {
        setFormData({
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || ''
        });
      }
    };
    loadPaymentData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveBankDetails = async () => {
    if (!formData.bank_name || !formData.account_number || !formData.ifsc_code) {
      toast.error('Please fill all bank details');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await updateUserProfile({
        bank_name: formData.bank_name.trim(),
        account_number: formData.account_number.trim(),
        ifsc_code: formData.ifsc_code.trim()
      });

      if (error) {
        toast.error('Failed to save bank details');
      } else {
        toast.success('Bank details saved successfully!');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Payment & Billing</h2>
        <p className="text-sm text-gray-600">Manage your payment methods and billing information</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#64b900] text-white text-xs rounded-full font-medium">
              Default
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
          + Add New Payment Method
        </Button>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
              Bank Name
            </Label>
            <Input
              id="bankName"
              value={formData.bank_name}
              onChange={(e) => handleInputChange('bank_name', e.target.value)}
              placeholder="Enter bank name"
              className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
              Account Number
            </Label>
            <Input
              id="accountNumber"
              value={formData.account_number}
              onChange={(e) => handleInputChange('account_number', e.target.value)}
              placeholder="Enter account number"
              className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode" className="text-sm font-medium text-gray-700">
              IFSC Code
            </Label>
            <Input
              id="ifscCode"
              value={formData.ifsc_code}
              onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
              placeholder="Enter IFSC code"
              className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button 
          onClick={handleSaveBankDetails}
          disabled={isSaving}
          className="bg-[#64b900] hover:bg-[#559900] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Bank Details'
          )}
        </Button>
      </div>
    </div>
  );
}

function KYCSettings() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <div className="bg-white rounded-full p-2">
          <ShieldCheck className="w-6 h-6 text-[#64b900]" />
        </div>
        <div>
          <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900">Verification Status</h2>
          <p className="text-sm text-gray-600 mt-1">Document verification and KYC</p>
        </div>
      </div>

      {/* Verification Items */}
      <div className="space-y-3">
        {/* Mobile Number Verified */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <Check className="w-5 h-5 text-[#64b900]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Mobile Number Verified</p>
              <p className="text-sm text-gray-600">Verified on Feb 20, 2026</p>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-[#64b900] text-white text-sm rounded-md font-medium">
            Verified
          </span>
        </div>

        {/* PAN Card Verification */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">PAN Card Verification</p>
              <p className="text-sm text-gray-600">Required for tax compliance and transactions</p>
            </div>
          </div>
          <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-6">
            Verify Now
          </Button>
        </div>

        {/* Aadhaar Verification */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Aadhaar Verification</p>
              <p className="text-sm text-gray-600">Complete Aadhaar verification for higher limits</p>
            </div>
          </div>
          <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-6">
            Verify Now
          </Button>
        </div>

        {/* Bank Account Verification */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Bank Account Verification</p>
              <p className="text-sm text-gray-600">Required for receiving payments</p>
            </div>
          </div>
          <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-6">
            Verify Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Language Preferences</h2>
        <p className="text-sm text-gray-600">Choose your preferred language for the platform</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayLanguage" className="text-sm font-medium text-gray-700">
            Display Language
          </Label>
          <Select defaultValue="en-IN">
            <SelectTrigger id="displayLanguage" className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-IN">English (India)</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
              <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
              <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
              <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region" className="text-sm font-medium text-gray-700">
            Region
          </Label>
          <Select defaultValue="india">
            <SelectTrigger id="region" className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
            Timezone
          </Label>
          <Select defaultValue="ist">
            <SelectTrigger id="timezone" className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ist">IST (GMT+5:30)</SelectItem>
              <SelectItem value="pst">PST (GMT-8:00)</SelectItem>
              <SelectItem value="est">EST (GMT-5:00)</SelectItem>
              <SelectItem value="gmt">GMT (GMT+0:00)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-8">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function ShippingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Return & Shipping</h2>
        <p className="text-sm text-gray-600">Manage your shipping addresses and return policies</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Addresses</h3>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Home Address</p>
                <p className="text-sm text-gray-600 mt-1">
                  123 Farm Road, New Delhi<br />
                  Delhi - 110001, India<br />
                  Phone: +91 9876543210
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#64b900] text-white text-xs rounded-full font-medium">
              Default
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Edit
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Remove
            </Button>
          </div>
        </div>

        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
          + Add New Address
        </Button>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Policy Preferences</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="returnWindow" className="text-sm font-medium text-gray-700">
              Return Window (Days)
            </Label>
            <Select defaultValue="7">
              <SelectTrigger id="returnWindow" className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Note:</span> Return policies apply to eligible products only. 
              Fresh produce may have different return conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button className="bg-[#64b900] hover:bg-[#559900] text-white px-8">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function TermsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Terms & Policies</h2>
        <p className="text-sm text-gray-600">Review our terms of service and privacy policies</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Terms of Service</p>
                <p className="text-sm text-gray-600">Last updated: March 1, 2026</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Privacy Policy</p>
                <p className="text-sm text-gray-600">Last updated: March 1, 2026</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Cookie Policy</p>
                <p className="text-sm text-gray-600">Last updated: February 15, 2026</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Refund Policy</p>
                <p className="text-sm text-gray-600">Last updated: February 1, 2026</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Community Guidelines</p>
                <p className="text-sm text-gray-600">Last updated: January 15, 2026</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg]" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          By using KisanSetu, you agree to our Terms of Service and Privacy Policy. 
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  );
}

function FraudSettings() {
  const [activityType, setActivityType] = useState('');
  const [fraudDetails, setFraudDetails] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmitFraudReport = () => {
    if (!activityType) {
      alert('Please select an activity type');
      return;
    }
    // In real implementation, this would send data to backend/admin panel
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setActivityType('');
      setFraudDetails('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">Report Fraud</h2>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Report any suspicious activity, fraud, or malpractice on the platform
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <div className="bg-white rounded-full p-2">
          <Flag className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-['Fraunces',sans-serif] text-lg text-gray-900 font-semibold">
            Help Us Keep KisanSetu Safe
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Your report helps us maintain a trustworthy marketplace for all users
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Activity Type */}
        <div className="space-y-2">
          <Label htmlFor="activityType" className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-700">
            Activity Type *
          </Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger 
              id="activityType" 
              className="border-gray-300 focus:border-[#64b900] focus:ring-[#64b900] font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              <SelectValue placeholder="Select an activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bid_manipulation">Bid Manipulation</SelectItem>
              <SelectItem value="fake_listings">Fake Listings</SelectItem>
              <SelectItem value="payment_fraud">Payment Fraud</SelectItem>
              <SelectItem value="identity_fraud">Identity Fraud</SelectItem>
              <SelectItem value="quality_deception">Quality Deception</SelectItem>
              <SelectItem value="quantity_fraud">Quantity Fraud</SelectItem>
              <SelectItem value="repeat_disputes">Repeat Disputes</SelectItem>
              <SelectItem value="shill_bidding">Shill Bidding</SelectItem>
              <SelectItem value="price_fixing">Price Fixing</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="spam_activity">Spam Activity</SelectItem>
              <SelectItem value="terms_violation">Terms of Service Violation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <Label htmlFor="fraudDetails" className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-700">
            Additional Details
          </Label>
          <textarea
            id="fraudDetails"
            value={fraudDetails}
            onChange={(e) => setFraudDetails(e.target.value)}
            rows={6}
            placeholder="Please provide detailed information about the fraudulent activity, including names, dates, transaction IDs, or any other relevant information..."
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#64b900] focus:border-transparent resize-none"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          />
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-yellow-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <span className="font-semibold">Important:</span> False reports may result in account suspension. 
            Please ensure your report is accurate and truthful. Our team will review all submissions carefully.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <div className="bg-white rounded-full p-1.5">
            <Check className="w-5 h-5 text-[#64b900]" />
          </div>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-green-900 font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Your fraud report has been submitted successfully. Our team will review it shortly.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button 
          onClick={handleSubmitFraudReport}
          className="bg-[#64b900] hover:bg-[#559900] text-white px-8 flex items-center gap-2 font-['Geologica:Regular',sans-serif]"
        >
          <Send className="w-4 h-4" />
          Submit Report
        </Button>
      </div>
    </div>
  );
}