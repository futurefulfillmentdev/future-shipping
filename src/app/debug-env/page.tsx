"use client";

import React, { useState, useEffect } from "react";

export default function DebugEnvPage() {
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApiAccess = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setApiTest({ status: response.status, data });
    } catch (err) {
      setApiTest({ 
        status: 'ERROR', 
        data: { error: err instanceof Error ? err.message : 'Unknown error' } 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiAccess();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Debug</h1>
        
        <div className="grid gap-6">
          {/* Client-side Environment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Client-side Environment</h2>
            <div className="space-y-2 text-sm">
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'undefined'}</div>
              <div><strong>NEXT_PUBLIC_*:</strong> Only NEXT_PUBLIC_ prefixed vars are available client-side</div>
              <div className="text-gray-600">
                Server-side environment variables (like HL_API_KEY) are not visible here for security.
              </div>
            </div>
          </div>

          {/* Server-side Environment Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Server-side Environment Test</h2>
            <button
              onClick={testApiAccess}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? "Testing..." : "Test Server Environment"}
            </button>
            
            {apiTest && (
              <div className={`p-4 rounded-lg ${
                apiTest.status === 200 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="mb-2"><strong>Status:</strong> {apiTest.status}</div>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(apiTest.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Test Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Test Links</h2>
            <div className="space-y-2">
              <a 
                href="/test-highlevel" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Test HighLevel API
              </a>
              <br />
              <a 
                href="/quiz" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Quiz (with enhanced logging)
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-yellow-800 font-semibold mb-4">Debug Steps</h2>
            <ol className="text-yellow-700 space-y-2 list-decimal list-inside">
              <li>Check if server environment shows HighLevel credentials are configured</li>
              <li>Test the HighLevel API directly using the test page</li>
              <li>Complete the quiz with browser console open (F12 → Console tab)</li>
              <li>Look for console logs that start with 🚀, 📡, ✅, ⚠️, or ❌</li>
              <li>If API calls fail, check the Network tab for failed requests</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 