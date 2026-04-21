# Message Attachments Storage Setup Guide

This guide will help you set up the Supabase Storage bucket required for file attachments in the messaging system.

## Quick Setup (Recommended)

1. **Try to upload a file** in the messaging system
2. **The setup modal will appear automatically** if the bucket doesn't exist
3. **Click "Copy SQL"** button in the modal
4. **Click "Open SQL Editor"** to go to your Supabase dashboard
5. **Paste the SQL** and click **Run**
6. **Close the modal** and try uploading again!

## Manual Setup

If you prefer to set this up manually before using the feature:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the SQL Script

Copy and paste the contents of `supabase-setup-message-attachments.sql` into the SQL Editor and click **Run**.

Or run this SQL directly:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own message attachments" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Allow public read access
CREATE POLICY "Allow public read access to message attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'message-attachments');

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own message attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Step 3: Verify Setup

Run this query to verify the bucket was created:

```sql
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'message-attachments';
```

You should see one row with the bucket details.

## What This Creates

### Storage Bucket
- **Name:** `message-attachments`
- **Visibility:** Public (files can be read by anyone with the URL)
- **File Size Limit:** 10MB per file
- **Allowed File Types:**
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOC, DOCX

### Security Policies
1. **Upload:** Authenticated users can upload files
2. **Read:** Public read access (anyone with URL can view)
3. **Update:** Users can only update their own files
4. **Delete:** Users can only delete their own files

## File Organization

Files are automatically organized by user ID:
```
message-attachments/
├── user-id-1/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.pdf
└── user-id-2/
    └── 1234567892-ghi789.png
```

## Troubleshooting

### Error: "Storage bucket not found"
**Solution:** Run the SQL setup script. The setup modal will guide you through this.

### Error: "Failed to upload file"
**Possible causes:**
- File is larger than 10MB
- File type is not supported
- User is not authenticated

### Error: "CREATE POLICY ... syntax error"
**Solution:** Make sure you're running the complete SQL script with the `DROP POLICY IF EXISTS` statements first.

## Need Help?

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project URL and anon key in your environment variables
3. Make sure you're authenticated before trying to upload files
4. Try re-running the SQL setup script

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
