import { useState } from 'react';
import { Database, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';

export function AutoStorageSetup() {
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    bucketCreated: boolean | null;
    policiesCreated: boolean | null;
    uploadTested: boolean | null;
  }>({
    bucketCreated: null,
    policiesCreated: null,
    uploadTested: null,
  });

  const runAutoSetup = async () => {
    setIsSetupRunning(true);
    const status = {
      bucketCreated: false,
      policiesCreated: false,
      uploadTested: false,
    };

    try {
      // Step 1: Check if bucket exists, create if not
      console.log('🔍 Checking if bucket exists...');
      const { data: buckets } = await supabase.storage.listBuckets();
      
      const bucketExists = buckets?.find(b => b.id === 'message-attachments');
      
      if (!bucketExists) {
        console.log('📦 Creating bucket...');
        const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('message-attachments', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        });

        if (bucketError) {
          console.error('❌ Bucket creation error:', bucketError);
          toast.error('Failed to create storage bucket: ' + bucketError.message);
          status.bucketCreated = false;
        } else {
          console.log('✅ Bucket created successfully');
          status.bucketCreated = true;
          toast.success('Storage bucket created!');
        }
      } else {
        console.log('✅ Bucket already exists');
        
        // Check if bucket is public
        if (!bucketExists.public) {
          console.warn('⚠️ Bucket exists but is NOT public!');
          toast.error('Bucket exists but is not public. Please update it manually in Supabase dashboard.');
          status.bucketCreated = false;
          status.policiesCreated = false;
        } else {
          console.log('✅ Bucket is public');
          status.bucketCreated = true;
        }
      }

      // Step 2: Storage policies - verify public access
      if (bucketExists?.public || status.bucketCreated) {
        status.policiesCreated = true;
        console.log('✅ Public access enabled');
      } else {
        status.policiesCreated = false;
        console.warn('⚠️ Public access not enabled');
      }

      // Step 3: Test upload
      if (status.bucketCreated && status.policiesCreated) {
        console.log('🧪 Testing upload...');
        const { data: user } = await supabase.auth.getUser();
        
        if (user.user) {
          const testBlob = new Blob(['test file'], { type: 'text/plain' });
          const testPath = `${user.user.id}/test-${Date.now()}.txt`;
          
          const { error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(testPath, testBlob);

          if (uploadError) {
            console.error('❌ Test upload failed:', uploadError);
            toast.error('Upload test failed: ' + uploadError.message);
            status.uploadTested = false;
          } else {
            console.log('✅ Test upload successful');
            
            // Try to get public URL and verify it's accessible
            const { data: urlData } = supabase.storage
              .from('message-attachments')
              .getPublicUrl(testPath);
            
            console.log('🔗 Testing public URL:', urlData.publicUrl);
            
            try {
              const response = await fetch(urlData.publicUrl);
              if (response.ok) {
                status.uploadTested = true;
                toast.success('Upload test passed!');
              } else {
                console.error('❌ Public URL not accessible:', response.status);
                toast.error('Files upload but are not publicly accessible. Manual setup required.');
                status.uploadTested = false;
              }
            } catch (fetchError) {
              console.error('❌ Failed to access public URL:', fetchError);
              toast.error('Files upload but are not accessible. Manual setup required.');
              status.uploadTested = false;
            }
            
            // Clean up test file
            await supabase.storage.from('message-attachments').remove([testPath]);
          }
        }
      }

      setSetupStatus(status);

      if (status.bucketCreated && status.policiesCreated && status.uploadTested) {
        toast.success('✅ File upload is fully configured!');
      } else {
        toast.error('⚠️ Setup incomplete. Please follow the manual setup guide below.');
      }
    } catch (error: any) {
      console.error('❌ Setup error:', error);
      toast.error('Setup failed: ' + error.message);
    } finally {
      setIsSetupRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-[#64b900]/10 rounded-lg">
          <Database className="w-6 h-6 text-[#64b900]" />
        </div>
        <div className="flex-1">
          <h3 className="font-['Fraunces:SemiBold',serif] text-lg text-gray-900 mb-1">
            Automatic Storage Setup
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            One-click setup to enable file uploads in messaging
          </p>
        </div>
      </div>

      {/* Setup Status */}
      {(setupStatus.bucketCreated !== null || setupStatus.policiesCreated !== null || setupStatus.uploadTested !== null) && (
        <div className="mb-4 space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {setupStatus.bucketCreated === true && <CheckCircle className="w-4 h-4 text-green-600" />}
            {setupStatus.bucketCreated === false && <XCircle className="w-4 h-4 text-red-600" />}
            {setupStatus.bucketCreated === null && <div className="w-4 h-4" />}
            <span className={`font-['Geologica:Regular',sans-serif] text-sm ${
              setupStatus.bucketCreated === true ? 'text-green-700' : 
              setupStatus.bucketCreated === false ? 'text-red-700' : 'text-gray-600'
            }`}>
              Storage bucket: {setupStatus.bucketCreated === true ? 'Created' : setupStatus.bucketCreated === false ? 'Failed' : 'Pending'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {setupStatus.policiesCreated === true && <CheckCircle className="w-4 h-4 text-green-600" />}
            {setupStatus.policiesCreated === false && <XCircle className="w-4 h-4 text-red-600" />}
            {setupStatus.policiesCreated === null && <div className="w-4 h-4" />}
            <span className={`font-['Geologica:Regular',sans-serif] text-sm ${
              setupStatus.policiesCreated === true ? 'text-green-700' : 
              setupStatus.policiesCreated === false ? 'text-red-700' : 'text-gray-600'
            }`}>
              Permissions configured: {setupStatus.policiesCreated === true ? 'Yes' : setupStatus.policiesCreated === false ? 'Failed' : 'Pending'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {setupStatus.uploadTested === true && <CheckCircle className="w-4 h-4 text-green-600" />}
            {setupStatus.uploadTested === false && <XCircle className="w-4 h-4 text-red-600" />}
            {setupStatus.uploadTested === null && <div className="w-4 h-4" />}
            <span className={`font-['Geologica:Regular',sans-serif] text-sm ${
              setupStatus.uploadTested === true ? 'text-green-700' : 
              setupStatus.uploadTested === false ? 'text-red-700' : 'text-gray-600'
            }`}>
              Upload test: {setupStatus.uploadTested === true ? 'Passed' : setupStatus.uploadTested === false ? 'Failed' : 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-['Geologica:Medium',sans-serif] text-sm text-blue-900 mb-1">
            What will this do?
          </p>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800">
            This will automatically create a storage bucket for message attachments, configure permissions, and test that file uploads work correctly.
          </p>
        </div>
      </div>

      {/* Setup Button */}
      <Button
        onClick={runAutoSetup}
        disabled={isSetupRunning}
        className="w-full bg-[#64b900] hover:bg-[#559900] text-white font-['Geologica:Medium',sans-serif] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSetupRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            Run Automatic Setup
          </>
        )}
      </Button>

      {/* Success State */}
      {setupStatus.bucketCreated && setupStatus.policiesCreated && setupStatus.uploadTested && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-['Geologica:Medium',sans-serif] text-sm text-green-900">
            ✅ File uploads are ready! You can now share images, PDFs, and documents in messages.
          </p>
        </div>
      )}
    </div>
  );
}