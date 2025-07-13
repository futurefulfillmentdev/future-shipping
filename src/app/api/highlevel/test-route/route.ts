import { NextRequest, NextResponse } from "next/server";

type SimpleFormData = {
  full_name: string;
  email: string;
  phone: string;
  website: string;
  monthly_order_volume: string;
  country: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = (await req.json()) as SimpleFormData;
    
    // Debug: Log what we received
    console.log("Received form data:", formData);
    
    // Check environment variables
    const apiKey = process.env.HL_API_KEY;
    const locationId = process.env.HL_LOCATION_ID;
    
    if (!apiKey || !locationId) {
      console.error("Missing HighLevel credentials:");
      console.error("HL_API_KEY:", apiKey ? "Present" : "Missing");
      console.error("HL_LOCATION_ID:", locationId ? "Present" : "Missing");
      
      return NextResponse.json({ 
        ok: false, 
        error: "Missing HighLevel credentials",
        details: {
          hasApiKey: !!apiKey,
          hasLocationId: !!locationId
        }
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!formData.email || !formData.full_name) {
      return NextResponse.json({ 
        ok: false, 
        error: "Missing required fields (email and full_name)" 
      }, { status: 400 });
    }
    
    // Parse name
    const [firstName, ...rest] = formData.full_name.split(" ");
    const lastName = rest.join(" ") || "-";
    
    // Create simplified payload with only the form fields
    const payload = {
      locationId,
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      source: "Future Fulfillment Test Form",
      tags: ["QUIZ"],
      customFields: [
        { key: "Monthly Order Volume", value: formData.monthly_order_volume },
        { key: "Country", value: formData.country },
        { key: "Website URL", value: formData.website },
        { key: "Test Source", value: "Simple Form Test" },
        { key: "Test Date", value: new Date().toISOString() }
      ].filter(field => field.value && field.value.trim() !== '')
    };
    
    console.log("Sending to HighLevel:", JSON.stringify(payload, null, 2));
    
    // Test the API call using correct v1 endpoint
    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    console.log("HighLevel response status:", response.status);
    console.log("HighLevel response:", responseText);
    
    if (response.ok) {
      const contactData = JSON.parse(responseText);
      return NextResponse.json({ 
        ok: true, 
        message: "Contact created successfully",
        contactId: contactData.id,
        response: contactData
      });
    } else {
      return NextResponse.json({ 
        ok: false, 
        error: "HighLevel API error",
        status: response.status,
        details: responseText
      }, { status: response.status });
    }
    
  } catch (err) {
    console.error("Test route error:", err);
    return NextResponse.json({ 
      ok: false, 
      error: "Server error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
} 