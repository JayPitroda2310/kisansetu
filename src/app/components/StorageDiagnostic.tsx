import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

export function StorageDiagnostic() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      diagnostics.tests.push({
        name: 'User Authentication',
        passed: !!user && !authError,
        details: user ? `Authenticated as: ${user.email}` : 'Not authenticated',
        error: authError?.message
      });

      // Test 2: List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      diagnostics.tests.push({
        name: 'List Storage Buckets',
        passed: !bucketsError && !!buckets,
        details: buckets ? `Found ${buckets.length} bucket(s)` : 'Unable to list buckets',
        data: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
        error: bucketsError?.message
      });

      // Test 3: Check if message-attachments bucket exists
      const bucketExists = buckets?.some(b => b.id === 'message-attachments' || b.name === 'message-attachments');
      diagnostics.tests.push({
        name: 'Message Attachments Bucket',
        passed: bucketExists,
        details: bucketExists ? 'Bucket exists' : 'Bucket NOT found',
        recommendation: bucketExists ? null : 'Run the SQL setup script'
      });

      // Test 4: Try to list files in the bucket (tests read permission)
      if (bucketExists) {
        const { data: files, error: listError } = await supabase.storage
          .from('message-attachments')
          .list('', { limit: 1 });
        
        diagnostics.tests.push({
          name: 'Read Permission Test',
          passed: !listError,
          details: listError ? 'Cannot list files' : 'Can list files',
          error: listError?.message
        });
      }

      // Test 5: Check bucket settings
      if (bucketExists) {
        const bucket = buckets?.find(b => b.id === 'message-attachments' || b.name === 'message-attachments');
        diagnostics.tests.push({
          name: 'Bucket Configuration',
          passed: bucket?.public === true,
          details: `Public: ${bucket?.public}, File Limit: ${bucket?.file_size_limit || 'N/A'}`,
          data: bucket
        });
      }

    } catch (error: any) {
      diagnostics.tests.push({
        name: 'General Error',
        passed: false,
        details: 'Unexpected error occurred',
        error: error.message
      });
    }

    setResults(diagnostics);
    setIsChecking(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-['Geologica:SemiBold',sans-serif] text-lg text-gray-900">
            Storage Diagnostics
          </h3>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mt-1">
            Check if file upload is properly configured
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 bg-[#64b900] hover:bg-[#559900] text-white rounded-lg font-['Geologica:Medium',sans-serif] text-sm transition-colors disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Run Diagnostics
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-4">
            Last checked: {new Date(results.timestamp).toLocaleString()}
          </div>

          {results.tests.map((test: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                test.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {test.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900">
                      {test.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-['Geologica:Medium',sans-serif] ${
                        test.passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {test.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700 mb-2">
                    {test.details}
                  </p>
                  {test.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800">
                      Error: {test.error}
                    </div>
                  )}
                  {test.recommendation && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-['Geologica:Medium',sans-serif] text-xs text-yellow-800">
                        💡 {test.recommendation}
                      </p>
                    </div>
                  )}
                  {test.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-['Geologica:Medium',sans-serif] text-xs text-gray-600 hover:text-gray-900">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-700">
                Overall Status:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-['Geologica:SemiBold',sans-serif] ${
                  results.tests.every((t: any) => t.passed)
                    ? 'bg-green-100 text-green-700'
                    : results.tests.some((t: any) => t.passed)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {results.tests.every((t: any) => t.passed)
                  ? '✓ All Checks Passed'
                  : results.tests.some((t: any) => t.passed)
                  ? '⚠ Some Issues Found'
                  : '✗ Setup Required'}
              </span>
            </div>
          </div>
        </div>
      )}

      {!results && (
        <div className="text-center py-8 text-gray-500">
          <p className="font-['Geologica:Regular',sans-serif] text-sm">
            Click "Run Diagnostics" to check your storage configuration
          </p>
        </div>
      )}
    </div>
  );
}
