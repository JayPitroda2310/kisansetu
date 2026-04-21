# 📎 File Upload Setup Guide for KisanSetu Messaging

## 🚀 Quick Setup (5 minutes)

### Step 1: Run the SQL Setup

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your KisanSetu project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste the SQL**
   - Open `/utils/supabase/storage-setup.sql`
   - Copy ALL the SQL code
   - Paste it into the SQL Editor
   - Click "RUN" button

4. **Verify Success**
   - You should see "Success. No rows returned"
   - This means the bucket and policies are created!

### Step 2: Verify in Storage

1. **Go to Storage section**
   - Click "Storage" in the left sidebar
   - You should see a bucket named `message-attachments`
   - Click on it to verify it's set to "Public"

2. **Check Policies**
   - Click the "Policies" tab
   - You should see 4 policies:
     - ✅ Users can upload message attachments
     - ✅ Users can view message attachments
     - ✅ Users can delete their own message attachments
     - ✅ Users can update their own message attachments

### Step 3: Test File Upload

1. **Log into your KisanSetu app**
2. **Go to Messages page**
3. **Select any conversation** (or create a new one)
4. **Click the paperclip 📎 icon**
5. **Select a file** (image, PDF, or document under 10MB)
6. **Watch for success!** ✨

---

## 🔍 Troubleshooting

### Problem: "Bucket not found" error

**Solution:**
```sql
-- Run this in SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;
```

### Problem: "Permission denied" error

**Solution:**
```sql
-- Delete existing policies first:
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own message attachments" ON storage.objects;

-- Then run the full SQL from storage-setup.sql again
```

### Problem: File uploads but shows XML error when opening

**Solution:**
- This usually means the bucket is not public
- Go to Storage → message-attachments → Settings
- Make sure "Public bucket" is toggled ON

### Problem: Getting logged out after upload

**Solution:**
- Check browser console (F12) for errors
- This might be a CORS issue
- Go to Supabase Dashboard → Settings → API
- Under "CORS Configuration", add your app URL

---

## 📊 Console Logging Guide

When you upload a file, you should see these logs in order:

### ✅ Success Flow:
```
📎 File selected: { name: "test.jpg", size: 12345, type: "image/jpeg", sizeMB: "0.01MB" }
✅ Validation passed, starting upload...
📤 Calling uploadMessageAttachment...
🔐 Getting user...
✅ User authenticated: abc123...
📝 Uploading file: { fileName: "...", fileType: "...", fileSize: ... }
✅ Upload successful: { ... }
🔗 Public URL generated: https://...
📥 Upload response: { uploadData: {...}, uploadError: null }
✅ File uploaded successfully, sending message...
✅ Message sent successfully: {...}
```

### ❌ Error Flow (with solutions):

**Bucket not found:**
```
❌ Upload error: { message: "Bucket not found" }
```
→ Run the SQL setup script

**Permission denied:**
```
❌ Upload error: { message: "new row violates row-level security policy" }
```
→ Check storage policies

**File too large:**
```
❌ File too large: 15.2MB
```
→ Choose a file under 10MB

---

## 🎯 Supported File Types

### Images
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP

### Documents
- ✅ PDF
- ✅ DOC/DOCX (Microsoft Word)

### Size Limit
- **Maximum: 10MB per file**

---

## 🔒 Security Features

1. **User Authentication Required**
   - Only logged-in users can upload files

2. **File Organization**
   - Files are stored in user-specific folders: `{user_id}/filename.ext`
   - Prevents file name conflicts

3. **Delete Protection**
   - Users can only delete their own uploaded files
   - Protected by Row Level Security (RLS)

4. **Public URLs**
   - Files get public URLs for easy sharing
   - Both sender and receiver can access the files

---

## 🎨 How It Works

### For Sender:
1. Click paperclip 📎
2. Select file
3. File uploads to Supabase Storage
4. Message is sent with file attachment
5. File appears in chat with preview (images) or download link (PDFs/docs)

### For Receiver:
1. Receives message with attachment
2. **Images**: Click to open in new tab
3. **PDFs/Documents**: Click to download

---

## 🆘 Still Having Issues?

1. **Check your Supabase project URL and keys**
   - Make sure they're correct in your `.env` file

2. **Check browser console**
   - Press F12 → Console tab
   - Look for red error messages
   - Share the error with your developer

3. **Test the diagnostics tool**
   - Go to Settings page
   - Find "Storage Diagnostics" section
   - Click "Run Diagnostics"
   - All checks should show ✅

4. **Verify authentication**
   - Make sure you're logged in
   - Try logging out and back in

---

## ✨ Success!

Once setup is complete, you'll be able to:
- ✅ Upload images, PDFs, and documents
- ✅ Share files in conversations
- ✅ Preview images in chat
- ✅ Download PDFs and documents
- ✅ Both sender and receiver can access files
- ✅ Files are securely stored in Supabase

Happy messaging! 🎉
