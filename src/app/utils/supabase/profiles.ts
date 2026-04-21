import { supabase } from './client';

export interface UserProfileData {
  id?: string;
  full_name: string;
  phone: string | null;
  role: 'farmer' | 'buyer' | 'both';
  location?: string;
  state?: string;
  district?: string;
  pincode?: string;
  farm_size?: number;
  farm_size_unit?: string;
  farming_experience?: number;
  primary_crops?: string[];
  business_name?: string;
  business_type?: string;
  gst_number?: string;
  profile_completed: boolean;
  kyc_status?: string;
  kyc_documents?: any;
  wallet_balance?: number;
  rating?: number;
  total_transactions?: number;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  farm_location?: string;
  aadhar_number?: string;
  pan_number?: string;
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<{ data: UserProfileData | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('No user logged in') };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: Partial<UserProfileData>): number {
  // Only use fields that exist in the base schema
  const requiredFields = [
    'full_name',
    'phone',
    'role',
  ];

  const optionalFields = [
    'location',
    'state',
    'pincode',
  ];

  // Role-specific fields
  const farmerFields = profile.role === 'farmer' || profile.role === 'both' ? [
    'farm_size',
    'primary_crops',
  ] : [];

  const buyerFields = profile.role === 'buyer' || profile.role === 'both' ? [
    'business_name',
    'business_type',
  ] : [];

  // Combine only base schema fields
  const allFields = [
    ...requiredFields,
    ...optionalFields,
    ...farmerFields,
    ...buyerFields,
  ];

  // Count filled fields
  const filledCount = allFields.filter(field => {
    const value = (profile as any)[field];
    if (Array.isArray(value)) {
      return value && value.length > 0;
    }
    return value && value.toString().trim() !== '';
  }).length;

  // Calculate percentage
  const percentage = Math.round((filledCount / allFields.length) * 100);
  return Math.min(100, percentage);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  profileData: Partial<UserProfileData>
): Promise<{ data: UserProfileData | null; error: any }> {
  try {
    console.log('🔧 updateUserProfile: Starting update...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ updateUserProfile: No user logged in');
      return { data: null, error: new Error('No user logged in') };
    }

    console.log('✅ updateUserProfile: User ID:', user.id);

    // Calculate completion percentage
    const { data: currentProfile } = await getUserProfile();
    const updatedProfile = { ...currentProfile, ...profileData };
    const completionPercentage = calculateProfileCompletion(updatedProfile);

    // Update profile_completed flag if completion is 100%
    const isCompleted = completionPercentage === 100;

    // Only include fields that exist in the base schema
    const safeProfileData: any = {
      updated_at: new Date().toISOString(),
    };

    // Add ONLY fields that are confirmed to exist in the database schema
    if (profileData.full_name !== undefined) safeProfileData.full_name = profileData.full_name;
    if (profileData.phone !== undefined) safeProfileData.phone = profileData.phone;
    if (profileData.role !== undefined) safeProfileData.role = profileData.role;
    if (profileData.location !== undefined) safeProfileData.location = profileData.location;
    if (profileData.state !== undefined) safeProfileData.state = profileData.state;
    if (profileData.district !== undefined) safeProfileData.district = profileData.district;
    if (profileData.pincode !== undefined) safeProfileData.pincode = profileData.pincode;
    if (profileData.farm_size !== undefined) safeProfileData.farm_size = profileData.farm_size;
    if (profileData.farm_size_unit !== undefined) safeProfileData.farm_size_unit = profileData.farm_size_unit;
    if (profileData.farming_experience !== undefined) safeProfileData.farming_experience = profileData.farming_experience;
    if (profileData.primary_crops !== undefined) safeProfileData.primary_crops = profileData.primary_crops;
    if (profileData.business_name !== undefined) safeProfileData.business_name = profileData.business_name;
    if (profileData.business_type !== undefined) safeProfileData.business_type = profileData.business_type;
    if (profileData.gst_number !== undefined) safeProfileData.gst_number = profileData.gst_number;
    if (profileData.avatar_url !== undefined) safeProfileData.avatar_url = profileData.avatar_url;
    if (profileData.bank_name !== undefined) safeProfileData.bank_name = profileData.bank_name;
    if (profileData.account_number !== undefined) safeProfileData.account_number = profileData.account_number;
    if (profileData.ifsc_code !== undefined) safeProfileData.ifsc_code = profileData.ifsc_code;
    // NEW FIELDS - Now added to database
    if (profileData.date_of_birth !== undefined) safeProfileData.date_of_birth = profileData.date_of_birth;
    if (profileData.gender !== undefined) safeProfileData.gender = profileData.gender;
    if (profileData.city !== undefined) safeProfileData.city = profileData.city;
    if (profileData.upi_id !== undefined) safeProfileData.upi_id = profileData.upi_id;
    if (profileData.farm_location !== undefined) safeProfileData.farm_location = profileData.farm_location;
    if (profileData.aadhar_number !== undefined) safeProfileData.aadhar_number = profileData.aadhar_number;
    if (profileData.pan_number !== undefined) safeProfileData.pan_number = profileData.pan_number;
    
    // Add profile_completed flag
    safeProfileData.profile_completed = isCompleted;

    console.log('📤 updateUserProfile: Sending data to Supabase:', safeProfileData);

    const { data, error } = await supabase
      .from('user_profiles')
      .update(safeProfileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ updateUserProfile: Supabase error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { data: null, error };
    }

    console.log('✅ updateUserProfile: Update successful!', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ updateUserProfile: Exception caught:', error);
    return { data: null, error };
  }
}

/**
 * Check if user profile is completed
 */
export async function isProfileCompleted(): Promise<boolean> {
  const { data } = await getUserProfile();
  return data?.profile_completed ?? false;
}

/**
 * Subscribe to profile changes
 */
export function subscribeToProfile(
  callback: (profile: UserProfileData | null) => void
) {
  const channel = supabase
    .channel('profile-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
      },
      async () => {
        const { data } = await getUserProfile();
        callback(data);
      }
    )
    .subscribe();

  return channel;
}