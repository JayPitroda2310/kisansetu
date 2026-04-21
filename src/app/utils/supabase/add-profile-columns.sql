-- Add additional profile columns for complete profile functionality
-- Run this migration to add missing columns to user_profiles table

-- Add columns if they don't already exist
DO $$ 
BEGIN
    -- Date of birth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='date_of_birth') THEN
        ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
    END IF;

    -- Gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='gender') THEN
        ALTER TABLE user_profiles ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
    END IF;

    -- Address (full address field)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='address') THEN
        ALTER TABLE user_profiles ADD COLUMN address TEXT;
    END IF;

    -- City
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='city') THEN
        ALTER TABLE user_profiles ADD COLUMN city TEXT;
    END IF;

    -- Bank details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='bank_name') THEN
        ALTER TABLE user_profiles ADD COLUMN bank_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='account_number') THEN
        ALTER TABLE user_profiles ADD COLUMN account_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='ifsc_code') THEN
        ALTER TABLE user_profiles ADD COLUMN ifsc_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='upi_id') THEN
        ALTER TABLE user_profiles ADD COLUMN upi_id TEXT;
    END IF;

    -- Farm location (separate from address)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='farm_location') THEN
        ALTER TABLE user_profiles ADD COLUMN farm_location TEXT;
    END IF;

    -- Document details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='aadhar_number') THEN
        ALTER TABLE user_profiles ADD COLUMN aadhar_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='pan_number') THEN
        ALTER TABLE user_profiles ADD COLUMN pan_number TEXT;
    END IF;

END $$;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_completed ON user_profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON user_profiles(kyc_status);

-- Add comment to the table
COMMENT ON TABLE user_profiles IS 'User profile information including personal, business, and verification details';
