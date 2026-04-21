import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface StorageSetupModalProps {
  onClose: () => void;
  onSetupComplete?: () => void;
}

export function StorageSetupModal({ onClose, onSetupComplete }: StorageSetupModalProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- KisanSetu: Message Attachments Storage Setup
-- Run this SQL in your Supabase SQL Editor

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
USING (bucket_id = 'message-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);`;

  const handleCopy = () => {
    // Fallback method for clipboard (works in all browsers/contexts)
    const textarea = document.createElement('textarea');
    textarea.value = sqlScript;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Try modern clipboard API as fallback
      navigator.clipboard?.writeText(sqlScript).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((clipboardErr) => {
        console.error('Clipboard API also failed:', clipboardErr);
        alert('Please manually copy the SQL script');
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#64b900]/5 to-white">
          <div>
            <h2 className="font-['Fraunces:SemiBold',serif] text-2xl text-gray-900">
              Setup Message Attachments
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mt-1">
              One-time setup required for file uploads
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-['Geologica:SemiBold',sans-serif] text-base text-gray-900 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-[#64b900] text-white rounded-full text-xs font-bold">1</span>
              Open Supabase SQL Editor
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 ml-8 mb-2">
              Go to your Supabase dashboard and click on <strong>SQL Editor</strong> in the left sidebar, then click <strong>New Query</strong>.
            </p>
            <a 
              href="https://supabase.com/dashboard/project/_/sql" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-8 inline-flex items-center gap-2 text-sm text-[#64b900] hover:text-[#559900] font-['Geologica:Medium',sans-serif]"
            >
              Open SQL Editor
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="mb-6">
            <h3 className="font-['Geologica:SemiBold',sans-serif] text-base text-gray-900 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-[#64b900] text-white rounded-full text-xs font-bold">2</span>
              Copy and Run SQL Script
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 ml-8 mb-3">
              Copy the SQL script below and paste it into the SQL Editor, then click <strong>Run</strong>.
            </p>
            
            {/* SQL Script Box */}
            <div className="ml-8 relative">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="font-['Geologica:Medium',sans-serif] text-xs text-gray-300">
                    setup-message-attachments.sql
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#64b900] hover:bg-[#559900] text-white rounded text-xs font-['Geologica:Medium',sans-serif] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy SQL
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="font-mono text-xs text-green-400 leading-relaxed">
                    {sqlScript}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-['Geologica:SemiBold',sans-serif] text-base text-gray-900 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-[#64b900] text-white rounded-full text-xs font-bold">3</span>
              Verify Setup
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 ml-8">
              After running the SQL, you should see a success message. The <strong>message-attachments</strong> bucket is now ready!
            </p>
          </div>

          <div className="ml-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-['Geologica:Medium',sans-serif] text-sm text-blue-800">
              💡 <strong>Tip:</strong> This setup only needs to be done once. After this, all users will be able to send file attachments in messages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <a 
            href="https://supabase.com/docs/guides/storage" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 font-['Geologica:Regular',sans-serif] flex items-center gap-1"
          >
            Learn more about Supabase Storage
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-colors"
            >
              I'll Do This Later
            </button>
            <button
              onClick={() => {
                onClose();
                if (onSetupComplete) {
                  onSetupComplete();
                }
              }}
              className="px-6 py-2.5 bg-[#64b900] hover:bg-[#559900] text-white rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-colors"
            >
              Done - Setup Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}