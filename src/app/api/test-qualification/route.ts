import { NextRequest, NextResponse } from "next/server";
import { pushToHighLevel } from "@/lib/highLevelService";

// Test data with different volume ranges to test qualification logic
const TEST_CONTACTS = [
  {
    full_name: "John Unqualified",
    email: "john.unqualified@test.com",
    phone: "+1234567890",
    website_url: "https://unqualified.example.com",
    products: "T-shirts, Hoodies",
    package_weight_choice: "Light (under 500g)",
    package_size_choice: "Small",
    volume_range: "100 – 300", // Should get "unqualified" tag
    customer_location_choice: "Domestic only",
    current_shipping_method: "Australia Post",
    biggest_shipping_problem: "High costs",
    sku_range_choice: "1-50",
    delivery_expectation_choice: "1-3 days",
    shipping_cost_choice: "$5-10",
    category: "Clothing & Accessories"
  },
  {
    full_name: "Sarah Qualified",
    email: "sarah.qualified@test.com", 
    phone: "+1234567891",
    website_url: "https://qualified.example.com",
    products: "Electronics, Gadgets",
    package_weight_choice: "Medium (500g-2kg)",
    package_size_choice: "Medium",
    volume_range: "500 – 1000", // Should get "qualified" tag
    customer_location_choice: "International",
    current_shipping_method: "FedEx",
    biggest_shipping_problem: "Tracking issues",
    sku_range_choice: "51-200",
    delivery_expectation_choice: "2-5 days",
    shipping_cost_choice: "$10-20",
    category: "Tech & Electronics"
  },
  {
    full_name: "Mike HighVolume",
    email: "mike.highvolume@test.com",
    phone: "+1234567892", 
    website_url: "https://highvolume.example.com",
    products: "Home & Garden, Tools",
    package_weight_choice: "Heavy (2kg+)",
    package_size_choice: "Large",
    volume_range: "1000+", // Should get "qualified" tag
    customer_location_choice: "Global",
    current_shipping_method: "DHL",
    biggest_shipping_problem: "Delivery speed",
    sku_range_choice: "200+",
    delivery_expectation_choice: "Same day",
    shipping_cost_choice: "$20+",
    category: "Home & Garden"
  },
  {
    full_name: "Emma EdgeCase",
    email: "emma.edge@test.com",
    phone: "+1234567893",
    website_url: "https://edge.example.com", 
    products: "Beauty, Cosmetics",
    package_weight_choice: "Light (under 500g)",
    package_size_choice: "Small",
    volume_range: "400+", // Should get "unqualified" tag (400 < 500)
    customer_location_choice: "Domestic only",
    current_shipping_method: "Australia Post",
    biggest_shipping_problem: "Packaging issues",
    sku_range_choice: "1-50",
    delivery_expectation_choice: "1-3 days",
    shipping_cost_choice: "$5-10",
    category: "Beauty & Personal Care"
  }
];

// Helper function to extract qualification tag from volume range (matches highLevelService.ts logic)
function getQualificationTag(volumeRange: string): string {
  if (!volumeRange) return "unqualified";
  
  // Handle "1000+" format
  if (volumeRange.includes("+")) {
    const number = parseInt(volumeRange.replace(/[^0-9]/g, ""));
    return number >= 500 ? "qualified" : "unqualified";
  }
  
  // Handle range formats like "300 – 500", "500 – 1000"
  const numbers = volumeRange.split(/[-–—]/).map(part => 
    parseInt(part.replace(/[^0-9]/g, ""))
  ).filter(n => !isNaN(n));
  
  if (numbers.length >= 1) {
    // Use the lower bound of the range for qualification
    const lowerBound = Math.min(...numbers);
    return lowerBound >= 500 ? "qualified" : "unqualified";
  }
  
  // Fallback for unparseable formats
  return "unqualified";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const testMode = url.searchParams.get('mode') || 'logic'; // 'logic' or 'live'
  const sendToHL = url.searchParams.get('send') === 'true';
  
  try {
    if (testMode === 'logic') {
      // Test qualification logic only
      const logicTests = TEST_CONTACTS.map(contact => ({
        name: contact.full_name,
        email: contact.email,
        volumeRange: contact.volume_range,
        expectedTag: getQualificationTag(contact.volume_range),
        reasoning: getQualificationReasoning(contact.volume_range)
      }));

      return NextResponse.json({
        success: true,
        testType: "Qualification Logic Test",
        message: "Testing qualification logic without sending to HighLevel",
        results: logicTests,
        summary: {
          total: logicTests.length,
          qualified: logicTests.filter(t => t.expectedTag === 'qualified').length,
          unqualified: logicTests.filter(t => t.expectedTag === 'unqualified').length
        },
        nextSteps: [
          "Add ?send=true to actually send test contacts to HighLevel",
          "Add ?mode=live&send=true to test live HighLevel integration"
        ]
      });
    }

    if (testMode === 'live' && sendToHL) {
      // Test with actual HighLevel API calls
      const apiKey = process.env.HL_API_KEY;
      const locationId = process.env.HL_LOCATION_ID;

      if (!apiKey || !locationId) {
        return NextResponse.json({
          success: false,
          error: "HighLevel credentials missing",
          message: "Please set HL_API_KEY and HL_LOCATION_ID in .env.local"
        }, { status: 400 });
      }

      const results = [];
      
      for (const contact of TEST_CONTACTS) {
        try {
          console.log(`Testing qualification for: ${contact.full_name} (${contact.volume_range})`);
          
          const expectedTag = getQualificationTag(contact.volume_range);
          const result = await pushToHighLevel(contact as any);
          
          results.push({
            name: contact.full_name,
            email: contact.email,
            volumeRange: contact.volume_range,
            expectedTag,
            hlResult: result,
            success: result?.success || false,
            contactId: result?.contactId,
            action: result?.action
          });
          
          // Add small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          results.push({
            name: contact.full_name,
            email: contact.email,
            volumeRange: contact.volume_range,
            expectedTag: getQualificationTag(contact.volume_range),
            hlResult: { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            success: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        testType: "Live HighLevel Integration Test",
        message: "Sent test contacts to HighLevel with qualification tags",
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          qualified: results.filter(r => r.expectedTag === 'qualified').length,
          unqualified: results.filter(r => r.expectedTag === 'unqualified').length
        },
        instructions: [
          "Check your HighLevel CRM to verify contacts were created/updated",
          "Verify that contacts have correct qualification tags (qualified/unqualified)",
          "Check that all custom fields are populated correctly",
          "Test with your actual HighLevel workflows"
        ]
      });
    }

    return NextResponse.json({
      success: true,
      availableTests: {
        logic: "/api/test-qualification?mode=logic - Test qualification logic only",
        live: "/api/test-qualification?mode=live&send=true - Send test data to HighLevel"
      },
      testContacts: TEST_CONTACTS.map(c => ({
        name: c.full_name,
        email: c.email,
        volumeRange: c.volume_range,
        expectedTag: getQualificationTag(c.volume_range)
      }))
    });

  } catch (error) {
    console.error("Test qualification error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Qualification test failed"
    }, { status: 500 });
  }
}

function getQualificationReasoning(volumeRange: string): string {
  if (!volumeRange) return "No volume range provided → unqualified";
  
  if (volumeRange.includes("+")) {
    const number = parseInt(volumeRange.replace(/[^0-9]/g, ""));
    return `Plus notation: ${number}+ → ${number >= 500 ? 'qualified (≥500)' : 'unqualified (<500)'}`;
  }
  
  const numbers = volumeRange.split(/[-–—]/).map(part => 
    parseInt(part.replace(/[^0-9]/g, ""))
  ).filter(n => !isNaN(n));
  
  if (numbers.length >= 1) {
    const lowerBound = Math.min(...numbers);
    return `Range: ${volumeRange} → lower bound ${lowerBound} → ${lowerBound >= 500 ? 'qualified (≥500)' : 'unqualified (<500)'}`;
  }
  
  return `Unparseable format: "${volumeRange}" → unqualified (fallback)`;
} 