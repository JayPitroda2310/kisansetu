# File Upload Troubleshooting Guide

If you're unable to upload files even after running the SQL setup, follow these steps:

## Step 1: Check Browser Console

1. **Open Browser DevTools** (F12 or Right-click → Inspect)
2. **Go to Console tab**
3. **Try to upload a file**
4. **Look for these logs:**
   - `Attempting to upload file:` - Shows file details
   - `Upload error details:` - Shows what went wrong
   - `Upload successful:` - Confirms upload worked
   - `Public URL generated:` - Shows the file URL

## Step 2: Verify SQL Was Run Successfully

### Go to Supabase SQL Editor and run this query:

```sql
-- Check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'message-attachments';
```

**Expected Result:**
- You should see **1 row** with:
  - `id`: message-attachments
  - `name`: message-attachments
  - `public`: true
  - `file_size_limit`: 10485760

**If you see 0 rows:**
- The bucket wasn't created
- Run the setup SQL again

### Check if policies exist:

```sql
-- List all storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%message-attachments%';
```

**Expected Result:**
- You should see **4 policies**:
  1. Allow authenticated users to upload message attachments
  2. Allow public read access to message attachments
  3. Allow users to update their own message attachments
  4. Allow users to delete their own message attachments

**If you see fewer than 4:**
- The policies weren't created
- Run the setup SQL again

## Step 3: Verify Bucket in Supabase UI

1. Go to: **Supabase Dashboard → Storage** (left sidebar)
2. You should see a bucket named **message-attachments**
3. Click on it
4. **Settings** should show:
   - **Public**: Yes ✓
   - **File size limit**: 10 MB
   - **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp, application/pdf, etc.

**If the bucket doesn't appear:**
- The SQL didn't run successfully
- Try creating it manually (see Step 4)

## Step 4: Manual Bucket Creation (Alternative Method)

If the SQL approach didn't work, create the bucket manually:

### A. Create Bucket in UI:

1. **Supabase Dashboard → Storage → New Bucket**
2. **Name:** `message-attachments`
3. **Public bucket:** ✓ Checked
4. **File size limit:** 10485760 (10 MB in bytes)
5. **Allowed MIME types:** 
   ```
   image/jpeg
   image/png
   image/gif
   image/webp
   application/pdf
   application/msword
   application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```
6. **Click "Create bucket"**

### B. Create Policies via SQL Editor:

```sql
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

## Step 5: Test Upload Again

1. **Refresh your KisanSetu app page** (Ctrl+R or Cmd+R)
2. **Open a message conversation**
3. **Click the paperclip icon** 📎
4. **Select a small test file** (less than 10MB)
5. **Watch the browser console** for logs

## Common Error Messages & Solutions

### Error: "Storage bucket not found"
**Cause:** The bucket doesn't exist in Supabase
**Solution:** 
- Verify bucket exists (Step 2)
- Create bucket manually (Step 4)

### Error: "new row violates row-level security policy"
**Cause:** Storage policies are missing or incorrect
**Solution:**
- Check policies exist (Step 2)
- Re-run policy creation SQL (Step 4B)

### Error: "JWT expired" or "User not authenticated"
**Cause:** You're not logged in
**Solution:**
- Log out and log back in
- Clear cookies and try again

### Error: "File size exceeds limit"
**Cause:** File is larger than 10MB
**Solution:**
- Use a smaller file
- Or increase the limit in bucket settings

### Error: "Invalid mime type"
**Cause:** File type is not allowed
**Solution:**
- Use a supported file type (images, PDF, DOC)
- Or add your file type to allowed_mime_types

## Step 6: Check Supabase Project Settings

### Verify your Supabase configuration:

1. **Check your environment variables** (or Supabase connection):
   - Supabase URL is correct
   - Supabase anon key is correct

2. **Check project status:**
   - Go to Supabase Dashboard → Settings → General
   - Project should be "Active" (not paused)

## Still Not Working?

### Share these details for debugging:

1. **Console log output** when trying to upload
2. **Result of this SQL query:**
   ```sql
   SELECT 
     b.id, 
     b.name, 
     b.public,
     b.file_size_limit,
     COUNT(p.policyname) as policy_count
   FROM storage.buckets b
   LEFT JOIN pg_policies p ON p.tablename = 'objects' AND p.policyname LIKE '%message-attachments%'
   WHERE b.id = 'message-attachments'
   GROUP BY b.id, b.name, b.public, b.file_size_limit;
   ```
   Expected: 1 row with policy_count = 4

3. **Screenshot of Storage section** in Supabase Dashboard

4. **Any error messages** from the browser console

## Quick Test Script

Run this in your browser console to test the upload function directly:

```javascript
// Test if we can access the storage bucket
const { data, error } = await supabase.storage.from('message-attachments').list();
console.log('Bucket test:', { data, error });

// If error, bucket doesn't exist or no permissions
// If data (even empty array), bucket is accessible
```

## Prevention

To avoid this issue in the future:

1. ✅ Always verify SQL ran successfully (check for success message)
2. ✅ Check Storage UI after running SQL
3. ✅ Test upload with a small file before announcing the feature
4. ✅ Keep the setup SQL file handy for new environments
