-- =====================================================
-- KisanSetu: Message Attachments Storage Setup
-- =====================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase dashboard
-- 2. Navigate to: SQL Editor (in the left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste this entire script
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- 6. You should see: "Success. No rows returned"
-- 7. Verify the bucket was created by checking the last SELECT query result
-- =====================================================

-- Create the storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own message attachments" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload message attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
);

-- Policy 2: Allow public read access to all files
CREATE POLICY "Allow public read access to message attachments"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'message-attachments'
);

-- Policy 3: Allow users to update their own files
CREATE POLICY "Allow users to update their own message attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Allow users to delete their own message attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'message-attachments';