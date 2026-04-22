import { FileText, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function FileUploadSetupInstructions() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<{
    bucketExists: boolean | null;
    bucketIsPublic: boolean | null;
    canUpload: boolean | null;
  }>({
    bucketExists: null,
    bucketIsPublic: null,
    canUpload: null,
  });

  const checkSetup = async () => {
    setIsChecking(true);
    const results = {
      bucketExists: false,
      bucketIsPublic: false,
      canUpload: false,
    };

    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (buckets) {
        const bucket = buckets.find(b => b.id === 'message-attachments');
        results.bucketExists = !!bucket;
        results.bucketIsPublic = bucket?.public || false;
      }

      // Try a test upload
      try {
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const { data: user } = await supabase.auth.getUser();
        
        if (user.user) {
          const testPath = `${user.user.id}/test-${Date.now()}.txt`;
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(testPath, testFile);

          if (!uploadError) {
            results.canUpload = true;
            // Clean up test file
            await supabase.storage.from('message-attachments').remove([testPath]);
          }
        }
      } catch (e) {
        results.canUpload = false;
      }

      setCheckResults(results);
      
      if (results.bucketExists && results.bucketIsPublic && results.canUpload) {
        toast.success('File upload is fully configured! ✅');
      } else {
        toast.error('File upload needs configuration. See instructions below.');
      }
    } catch (error) {
      console.error('Setup check error:', error);
      toast.error('Failed to check setup');
    } finally {
      setIsChecking(false);
    }
  };

  const copySQL = () => {
    const sql = `-- =====================================================
-- SUPABASE STORAGE SETUP FOR MESSAGE ATTACHMENTS
-- =====================================================

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- 3. Allow authenticated users to view files
CREATE POLICY "Users can view message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-attachments');

-- 4. Allow users to delete their own files
CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Allow users to update their own files
CREATE POLICY "Users can update their own message attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'message-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);`;

    navigator.clipboard.writeText(sql);
    toast.success('SQL copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-[#64b900]/10 rounded-lg">
          <FileText className="w-6 h-6 text-[#64b900]" />
        </div>
        <div className="flex-1">
          <h3 className="font-['Fraunces:SemiBold',serif] text-lg text-gray-900 mb-1">
            File Upload Setup
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Configure Supabase Storage to enable file sharing in messages
          </p>
        </div>
      </div>

      {/* Status Check */}
      <div className="mb-6">
        <button
          onClick={checkSetup}
          disabled={isChecking}
          className="w-full px-4 py-2.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Medium',sans-serif] text-sm disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Current Status'}
        </button>

        {checkResults.bucketExists !== null && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {checkResults.bucketExists ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-['Geologica:Regular',sans-serif] ${checkResults.bucketExists ? 'text-green-700' : 'text-red-700'}`}>
                Bucket exists: {checkResults.bucketExists ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {checkResults.bucketIsPublic ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-['Geologica:Regular',sans-serif] ${checkResults.bucketIsPublic ? 'text-green-700' : 'text-red-700'}`}>
                Bucket is public: {checkResults.bucketIsPublic ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {checkResults.canUpload ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-['Geologica:Regular',sans-serif] ${checkResults.canUpload ? 'text-green-700' : 'text-red-700'}`}>
                Can upload files: {checkResults.canUpload ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-3">
          Setup Instructions:
        </h4>
        <ol className="space-y-2 font-['Geologica:Regular',sans-serif] text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-semibold text-[#64b900]">1.</span>
            <span>Copy the SQL code below by clicking the "Copy SQL" button</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-[#64b900]">2.</span>
            <span>Go to your Supabase Dashboard → SQL Editor</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-[#64b900]">3.</span>
            <span>Paste the SQL code and click "RUN"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-[#64b900]">4.</span>
            <span>Come back here and click "Check Current Status"</span>
          </li>
        </ol>
      </div>

      {/* Copy SQL Button */}
      <button
        onClick={copySQL}
        className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-['Geologica:Medium',sans-serif] text-sm flex items-center justify-center gap-2"
      >
        <Database className="w-4 h-4" />
        Copy SQL to Clipboard
      </button>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-['Geologica:Medium',sans-serif] text-sm text-blue-900 mb-1">
            What does this do?
          </p>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800">
            This creates a secure storage bucket for message attachments (images, PDFs, documents) and sets up permissions so users can upload and view files in conversations.
          </p>
        </div>
      </div>
    </div>
  );
}
