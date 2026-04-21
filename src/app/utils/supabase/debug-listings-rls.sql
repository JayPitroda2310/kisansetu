-- ============================================
-- DEBUG: Check listings and RLS policies
-- Run this in Supabase SQL Editor to diagnose the issue
-- ============================================

-- 1. Check if listings exist
SELECT 
  COUNT(*) as total_listings,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_listings,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_listings
FROM listings;

-- 2. Show sample listings
SELECT 
  id,
  product_name,
  status,
  seller_id,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check current RLS policies on listings
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'listings';

-- 5. Test if current user can see listings (run this while logged in)
-- This will show what the authenticated user can see
SELECT 
  id,
  product_name,
  status,
  auth.uid() as current_user_id,
  seller_id,
  CASE 
    WHEN seller_id = auth.uid() THEN 'Own listing'
    ELSE 'Other seller'
  END as ownership
FROM listings
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEBUG COMPLETE - Check results above';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Check if listings exist in the database';
  RAISE NOTICE '2. Check if RLS policies are correct';
  RAISE NOTICE '3. Check if authenticated user can see listings';
  RAISE NOTICE '========================================';
END $$;
