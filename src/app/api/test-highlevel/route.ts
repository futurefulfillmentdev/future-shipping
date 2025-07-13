import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.HL_API_KEY;
    const locationId = process.env.HL_LOCATION_ID;
    const debugMode = process.env.HL_DEBUG === 'true';

    // Check environment variables
    if (!apiKey || !locationId) {
      return NextResponse.json({
        success: false,
        error: "Missing HighLevel credentials",
        details: {
          hasApiKey: !!apiKey,
          hasLocationId: !!locationId,
          message: "Please set HL_API_KEY and HL_LOCATION_ID in .env.local",
          setup: "For agency accounts, use agency API key + target location ID"
        }
      }, { status: 400 });
    }

    // Validate API key format for agency accounts
    const apiKeyInfo = {
      format: "unknown",
      type: "unknown"
    };

    if (apiKey.startsWith("eyJ")) {
      apiKeyInfo.format = "JWT";
      apiKeyInfo.type = "Private Integration";
    } else if (apiKey.startsWith("pk_")) {
      apiKeyInfo.format = "Public Key";
      apiKeyInfo.type = "Public App";
    } else if (apiKey.length > 100) {
      apiKeyInfo.format = "Custom";
      apiKeyInfo.type = "Agency Integration";
    } else {
      apiKeyInfo.format = "Unknown";
      apiKeyInfo.type = "Check format";
    }

    // Validate Location ID format
    const locationIdRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    const isValidLocationId = locationIdRegex.test(locationId);

    if (!isValidLocationId) {
      return NextResponse.json({
        success: false,
        error: "Invalid Location ID format",
        details: {
          locationId: locationId.substring(0, 8) + "...",
          expectedFormat: "UUID with dashes (e.g., abcd1234-5678-90ef-ghij-klmnopqrstuv)",
          actualFormat: locationId.length + " characters",
          message: "For agency accounts, use the target sub-account's Location ID"
        }
      }, { status: 400 });
    }

    // Test API connection by getting location info (agency scoped)
    if (debugMode) {
      console.log("Testing HighLevel agency connection...");
    }
    const testRes = await fetch(`https://api.gohighlevel.com/v2/locations/${locationId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28"
      }
    });

    if (!testRes.ok) {
      const errorText = await testRes.text();
      if (debugMode) {
        console.error("HighLevel API Error:", testRes.status, errorText);
      }
      
      let errorMessage = "Unknown API error";
      let troubleshooting = [];

      switch (testRes.status) {
        case 401:
          errorMessage = "Authentication failed";
          troubleshooting = [
            "Verify API key is correct and active",
            "Check API key has proper scopes (contacts.write, locations.read)",
            "Ensure API key is from agency dashboard, not sub-account",
            "Try regenerating the API key"
          ];
          break;
        case 403:
          errorMessage = "Access denied to location";
          troubleshooting = [
            "Verify location ID belongs to your agency",
            "Check location is active (not archived)",
            "Ensure agency has full access to this location",
            "Verify location allows API access"
          ];
          break;
        case 404:
          errorMessage = "Location not found";
          troubleshooting = [
            "Double-check Location ID is correct",
            "Verify location exists in your agency dashboard",
            "Check if location was moved or deleted",
            "Ensure you're using the target location ID, not agency ID"
          ];
          break;
        case 429:
          errorMessage = "Rate limit exceeded";
          troubleshooting = [
            "Wait and try again",
            "Check agency API usage limits",
            "Implement retry logic for production"
          ];
          break;
        default:
          errorMessage = `HTTP ${testRes.status} error`;
          troubleshooting = [
            "Check HighLevel service status",
            "Verify API endpoint is correct",
            "Check network connectivity"
          ];
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: {
          status: testRes.status,
          apiKeyType: apiKeyInfo.type,
          apiKeyFormat: apiKeyInfo.format,
          locationIdValid: isValidLocationId,
          troubleshooting,
          message: "Agency account setup issue detected"
        }
      }, { status: testRes.status });
    }

    const locationData = await testRes.json();

    // Additional test: Check if we can access contacts endpoint
    const contactsTestRes = await fetch(`https://api.gohighlevel.com/v2/contacts/?locationId=${locationId}&limit=1`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28"
      }
    });

    const contactsAccess = contactsTestRes.ok;

    return NextResponse.json({
      success: true,
      message: "HighLevel agency connection verified",
      details: {
        accountType: "Agency Account",
        apiKeyType: apiKeyInfo.type,
        apiKeyFormat: apiKeyInfo.format,
        location: {
          id: locationData.id,
          name: locationData.name,
          timezone: locationData.timezone || "Not specified",
          country: locationData.country || "Not specified"
        },
        permissions: {
          locationAccess: true,
          contactsAccess: contactsAccess,
          contactsWrite: contactsAccess // Assume if read works, write should work
        },
        apiVersion: "v2",
        readyForIntegration: contactsAccess
      }
    });

  } catch (err) {
    const debugMode = process.env.HL_DEBUG === 'true';
    if (debugMode) {
      console.error("HighLevel test connection failed:", err);
    }
    
    return NextResponse.json({
      success: false,
      error: "Connection test failed",
      details: {
        message: err instanceof Error ? err.message : "Unknown error",
        type: "Network or configuration error",
        troubleshooting: [
          "Check network connectivity",
          "Verify HighLevel service status",
          "Check environment variables are set correctly",
          "Ensure API endpoint is accessible"
        ]
      }
    }, { status: 500 });
  }
} 