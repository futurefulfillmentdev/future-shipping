"use client";

import React, { useState } from "react";

export default function TestHighLevel() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    website: "",
    monthly_order_volume: "",
    country: ""
  });
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/highlevel/test-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResponse({
        status: "ERROR",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#6BE53D]">HighLevel API Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website *</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Web URL goes here"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Monthly Order Volume *</label>
            <input
              type="text"
              name="monthly_order_volume"
              value={formData.monthly_order_volume}
              onChange={handleInputChange}
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Example: 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country *</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white"
            >
              <option value="">Select Country</option>
              <option value="Australia">Australia</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="New Zealand">New Zealand</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6BE53D] hover:bg-[#5BC72D] text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test HighLevel API"}
          </button>
        </form>

        {response && (
          <div className="mt-8 bg-white/5 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">API Response</h2>
            <div className="mb-2">
              <span className="font-medium">Status: </span>
              <span className={response.status === 200 ? "text-green-400" : "text-red-400"}>
                {response.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium">Time: </span>
              <span className="text-gray-300">{response.timestamp}</span>
            </div>
            <div>
              <span className="font-medium">Response:</span>
              <pre className="mt-2 p-4 bg-black/30 rounded-lg overflow-auto text-sm">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
          <h3 className="text-yellow-400 font-bold mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a <code className="bg-black/30 px-1 rounded">.env.local</code> file in your quiz-app directory</li>
            <li>Add your HighLevel credentials:
              <pre className="mt-1 p-2 bg-black/30 rounded text-xs">
{`HL_API_KEY=your_api_key_here
HL_LOCATION_ID=your_location_id_here
HL_DEBUG=true`}
              </pre>
            </li>
            <li>Get your API key from HighLevel: Settings → API & Webhooks → Create API Key</li>
            <li>Find your Location ID in your HighLevel URL or API documentation</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 