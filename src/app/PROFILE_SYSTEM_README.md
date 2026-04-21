# Profile Completion System - Implementation Guide

## Overview
The profile completion system is now fully functional with Supabase integration. It ensures users complete their profiles before accessing the dashboard, with real-time percentage tracking and persistence.

## Features Implemented

### 1. **Mandatory Profile Completion**
- When a user logs in for the first time, they see a full-screen profile completion form
- Users cannot access the dashboard until they complete all required fields
- Once completed, the modal never shows again

### 2. **Real-time Completion Tracking**
- Profile completion percentage is calculated in real-time as users fill in fields
- Progress bar shows visual feedback of completion status
- Percentage is stored and tracked in Supabase

### 3. **Comprehensive Profile Fields**
The system tracks the following information:

**Basic Information (Required)**:
- Full Name
- Mobile Number
- Email Address
- Date of Birth
- Gender

**Address Information (Required)**:
- Full Address
- City
- State
- PIN Code

**Role-Specific Details (Required)**:
- **For Farmers**: Farm Size, Primary Crops, Farm Location, Years of Experience
- **For Buyers**: Company Name, Business Type, GST Number (optional), Business Address

**Financial Information (Optional)**:
- Bank Name
- Account Number
- IFSC Code
- UPI ID

**Document Information (Required for 100% completion)**:
- Aadhar Number
- PAN Number

### 4. **Design Preservation**
- Uses the existing ProfilePage design (as per CRITICAL DESIGN RULE)
- Only backend integration added - no new UI components created
- Maintains the same look and feel across the platform

## Database Setup

### Step 1: Run the Migration
Execute the SQL migration to add the necessary columns:

```sql
-- File: /utils/supabase/add-profile-columns.sql
-- Run this in your Supabase SQL Editor
```

This adds the following columns to the `user_profiles` table:
- `date_of_birth` (DATE)
- `gender` (TEXT with CHECK constraint)
- `address` (TEXT)
- `city` (TEXT)
- `bank_name` (TEXT)
- `account_number` (TEXT)
- `ifsc_code` (TEXT)
- `upi_id` (TEXT)
- `farm_location` (TEXT)
- `aadhar_number` (TEXT)
- `pan_number` (TEXT)

### Step 2: Verify Existing Columns
Ensure your `user_profiles` table has these columns (from the base schema):
- `id` (UUID, Primary Key)
- `full_name` (TEXT)
- `phone` (TEXT)
- `role` (TEXT)
- `location` (TEXT)
- `state` (TEXT)
- `pincode` (TEXT)
- `profile_completed` (BOOLEAN, DEFAULT FALSE)
- `farm_size` (DECIMAL)
- `primary_crops` (TEXT[])
- `farming_experience` (INTEGER)
- `business_name` (TEXT)
- `business_type` (TEXT)
- `gst_number` (TEXT)

## How It Works

### 1. **Login Flow**
```typescript
User logs in → DashboardLayout checks profile_completed flag
  ↓
If profile_completed = false → Show ProfilePage in completion mode
  ↓
User fills in required fields → Profile completion % updates real-time
  ↓
User clicks "Save Changes" → Data saved to Supabase
  ↓
If all required fields filled → profile_completed = true
  ↓
User redirected to dashboard → Modal never shows again
```

### 2. **Completion Percentage Calculation**
The `calculateProfileCompletion()` function evaluates:

- **Required Fields** (must be filled): full_name, phone, role
- **Optional Personal Fields**: location, state, pincode, date_of_birth, gender
- **Role-Specific Fields**:
  - Farmers: farm_size, primary_crops, farm_location
  - Buyers: business_name, business_type
- **Financial Fields**: bank_name, account_number, ifsc_code
- **Document Fields**: aadhar_number, pan_number

Percentage = (Filled Fields / Total Fields) × 100

### 3. **Real-time Updates**
- Uses Supabase subscriptions to listen for profile changes
- Updates completion percentage automatically when data changes
- Syncs across all components using the subscription system

## File Structure

```
/utils/supabase/
  profiles.ts                    # Profile management utilities
  add-profile-columns.sql        # Database migration for new columns

/components/dashboard/
  ProfilePage.tsx                # Main profile component (with completion mode)
  DashboardLayout.tsx            # Handles profile completion check

/components/
  ProfileCompletionPage.tsx      # Original multi-step modal (kept for reference)
```

## Key Components

### ProfilePage Component
**Props**:
- `userRole`: 'farmer' | 'buyer' | 'both' - User's role
- `isCompletionMode`: boolean - Shows completion banner and enforces validation
- `onComplete`: () => void - Callback when profile is completed
- `initialData`: object - Pre-filled data (email, name, etc.)

**Modes**:
1. **Completion Mode** (`isCompletionMode=true`):
   - Full-screen layout with welcome message
   - Progress bar showing completion percentage
   - Strict validation - all required fields must be filled
   - "Save Changes" triggers `onComplete` when 100% complete

2. **Edit Mode** (`isCompletionMode=false`):
   - Regular dashboard layout
   - Optional fields can be left empty
   - Standard save functionality

### DashboardLayout Component
**Responsibilities**:
- Checks `profile_completed` flag on mount
- Shows ProfilePage in completion mode if not completed
- Subscribes to profile changes for real-time updates
- Manages loading states during profile check

## Usage Examples

### Example 1: Force Profile Completion
```typescript
// User just signed up - force profile completion
<ProfilePage 
  isCompletionMode={true}
  userRole="farmer"
  onComplete={() => {
    // Redirect to dashboard
    navigate('/dashboard');
  }}
  initialData={{
    fullName: user.name,
    email: user.email
  }}
/>
```

### Example 2: Edit Profile (Optional)
```typescript
// User editing their profile from settings
<ProfilePage 
  isCompletionMode={false}
  userRole={currentUser.role}
/>
```

### Example 3: Check Profile Status
```typescript
import { getUserProfile, isProfileCompleted } from '@/utils/supabase/profiles';

// Check if profile is complete
const completed = await isProfileCompleted();

if (!completed) {
  // Show completion modal
  setShowProfileCompletion(true);
}
```

## Testing Checklist

### ✅ Profile Completion Flow
- [ ] New user sees profile completion modal immediately
- [ ] Modal is full-screen with green banner
- [ ] Progress bar shows 0% initially
- [ ] Percentage increases as fields are filled
- [ ] Required fields are enforced
- [ ] "Save Changes" button disabled until all required fields filled
- [ ] Success toast appears when profile saved
- [ ] User redirected to dashboard after completion
- [ ] Modal never appears again after completion

### ✅ Data Persistence
- [ ] Profile data saved to Supabase correctly
- [ ] `profile_completed` flag set to true when 100% complete
- [ ] Data persists across sessions
- [ ] Real-time updates work across tabs

### ✅ Role-Based Fields
- [ ] Farmer role shows farm-specific fields
- [ ] Buyer role shows business-specific fields
- [ ] Fields validate correctly based on role
- [ ] Completion percentage accounts for role-specific fields

### ✅ Edge Cases
- [ ] Handles missing email gracefully
- [ ] Works with partially filled profiles
- [ ] Error handling for Supabase failures
- [ ] Loading states shown appropriately

## API Reference

### `/utils/supabase/profiles.ts`

#### `getUserProfile()`
```typescript
async function getUserProfile(): Promise<{ 
  data: UserProfileData | null; 
  error: any 
}>
```
Gets the current user's complete profile from Supabase.

#### `updateUserProfile(profileData)`
```typescript
async function updateUserProfile(
  profileData: Partial<UserProfileData>
): Promise<{ 
  data: UserProfileData | null; 
  error: any 
}>
```
Updates user profile and automatically sets `profile_completed` when 100%.

#### `calculateProfileCompletion(profile)`
```typescript
function calculateProfileCompletion(
  profile: Partial<UserProfileData>
): number
```
Calculates completion percentage (0-100) based on filled fields.

#### `isProfileCompleted()`
```typescript
async function isProfileCompleted(): Promise<boolean>
```
Quick check if user's profile is complete.

#### `subscribeToProfile(callback)`
```typescript
function subscribeToProfile(
  callback: (profile: UserProfileData | null) => void
): RealtimeChannel
```
Subscribe to real-time profile updates.

## Best Practices

1. **Always check profile completion on app load**
   ```typescript
   useEffect(() => {
     checkProfileStatus();
   }, []);
   ```

2. **Use subscriptions for real-time updates**
   ```typescript
   const channel = subscribeToProfile((profile) => {
     updateLocalState(profile);
   });
   
   return () => supabase.removeChannel(channel);
   ```

3. **Handle errors gracefully**
   ```typescript
   const { data, error } = await updateUserProfile(profileData);
   if (error) {
     toast.error('Failed to save profile');
     return;
   }
   ```

4. **Provide visual feedback**
   - Show loading spinners during data fetch
   - Display progress bars for completion status
   - Use toast notifications for success/error

## Future Enhancements

- [ ] Add profile picture upload functionality
- [ ] Implement document verification (Aadhar, PAN)
- [ ] Add bank account verification
- [ ] Support for multiple addresses
- [ ] Profile completion reminders
- [ ] Export profile data feature

## Troubleshooting

### Issue: Profile completion modal keeps showing
**Solution**: Check if `profile_completed` flag is being set correctly in Supabase.

### Issue: Percentage not updating
**Solution**: Verify all form fields are connected to state correctly.

### Issue: Data not saving
**Solution**: Check Supabase RLS policies - ensure authenticated users can update their own profiles.

### Issue: Loading forever
**Solution**: Check network tab for Supabase errors. Ensure user is authenticated.

## Support

For issues or questions:
1. Check the console for error messages
2. Verify Supabase connection
3. Ensure database migration was run successfully
4. Review RLS policies in Supabase dashboard
