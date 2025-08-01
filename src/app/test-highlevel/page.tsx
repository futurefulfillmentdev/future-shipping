"use client";

import React, { useState } from "react";

export default function TestHighLevelPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testData = {
    full_name: "Test User",
    email: "test@example.com",
    phone: "+1234567890",
    website_url: "example.com",
    products: "Clothing & Accessories",
    package_weight_choice: "0.5 kg – 1 kg",
    package_size_choice: "Small (<3 cm thick)",
    volume_range: "300 – 500",
    customer_location_choice: "Australia only",
    current_shipping_method: "Home / garage",
    biggest_shipping_problem: "Costs too high",
    sku_range_choice: "26-100",
    delivery_expectation_choice: "2-3 days",
    shipping_cost_choice: "$5-$10",
    category: "Clothing & Accessories"
  };

  const testHighLevel = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing HighLevel API with data:", testData);
      
      const response = await fetch('/api/highlevel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(testData)
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(`HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HighLevel API Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>

        <button
          onClick={testHighLevel}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? "Testing..." : "Test HighLevel API"}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">Success</h3>
            <pre className="text-green-700 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Debug Instructions</h3>
          <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Click "Test HighLevel API" button</li>
            <li>Check console logs for detailed request/response information</li>
            <li>Check Network tab for HTTP request details</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 