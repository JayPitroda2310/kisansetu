import { useState } from 'react';
import { Database, CheckCircle, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function StorageSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-[#64b900]/10 rounded-lg">
          <Database className="w-6 h-6 text-[#64b900]" />
        </div>
        <div className="flex-1">
          <h3 className="font-['Fraunces:SemiBold',serif] text-lg text-gray-900 mb-1">
            Fix File Upload Access - 2 Minute Setup
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Follow these steps in your Supabase dashboard to enable file sharing
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-['Geologica:SemiBold',sans-serif] text-sm text-red-900 mb-1">
            Files Currently Not Accessible
          </p>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-red-800">
            The storage bucket exists but files aren't publicly accessible. Complete the steps below to fix this.
          </p>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#64b900] text-white rounded-full flex items-center justify-center text-sm font-['Geologica:SemiBold',sans-serif]">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-1">
                Open Supabase Dashboard
              </h4>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-2">
                Go to your Supabase project and navigate to Storage
              </p>
              <a
                href="https://supabase.com/dashboard/project/_/storage/buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-['Geologica:Medium',sans-serif] text-gray-700 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open Supabase Storage
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#64b900] text-white rounded-full flex items-center justify-center text-sm font-['Geologica:SemiBold',sans-serif]">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-1">
                Find "message-attachments" Bucket
              </h4>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">
                Look for the bucket named "message-attachments" in the list
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#64b900] text-white rounded-full flex items-center justify-center text-sm font-['Geologica:SemiBold',sans-serif]">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-1">
                Click the ⋮ (three dots) menu → Configuration
              </h4>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">
                Open the bucket settings
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#64b900] text-white rounded-full flex items-center justify-center text-sm font-['Geologica:SemiBold',sans-serif]">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-2">
                Enable "Public bucket"
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-700 mb-1">
                  ✅ Toggle ON the "Public bucket" option
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600">
                  This allows anyone with the link to view files
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#64b900] text-white rounded-full flex items-center justify-center text-sm font-['Geologica:SemiBold',sans-serif]">
              5
            </div>
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-2">
                Add Storage Policy (Copy & Paste)
              </h4>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600 mb-2">
                Go to Storage → Policies → Create new policy
              </p>
              
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Geologica:Medium',sans-serif] text-xs text-gray-700">
                      Policy Name:
                    </span>
                    <button
                      onClick={() => copyToClipboard('Public Access', 1)}
                      className="text-[#64b900] hover:text-[#559900] text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedStep === 1 ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="font-mono text-xs text-gray-900 block">
                    Public Access
                  </code>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Geologica:Medium',sans-serif] text-xs text-gray-700">
                      Policy Definition (SELECT):
                    </span>
                    <button
                      onClick={() => copyToClipboard('true', 2)}
                      className="text-[#64b900] hover:text-[#559900] text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedStep === 2 ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="font-mono text-xs text-gray-900 block">
                    true
                  </code>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-blue-800">
                    <strong>Operations to enable:</strong> SELECT (read access)
                    <br />
                    <strong>Target roles:</strong> public
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-green-900 mb-1">
                Done! Test File Upload
              </h4>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-green-800">
                Go to Messages, upload a file, and both users will now be able to view/download it!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Solution */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="font-['Geologica:SemiBold',sans-serif] text-sm text-yellow-900 mb-1">
          ⚡ Quick Alternative
        </p>
        <p className="font-['Geologica:Regular',sans-serif] text-xs text-yellow-800">
          If you can't access Supabase dashboard, contact your project admin to complete these steps, or delete and recreate the bucket with public access enabled.
        </p>
      </div>
    </div>
  );
}
