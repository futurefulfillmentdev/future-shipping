import { NextRequest, NextResponse } from "next/server";
import { pushToHighLevel } from "@/lib/highLevelService";

export async function POST(req: NextRequest) {
  try {
    const answers = (await req.json()) as any;
    const debugMode = process.env.HL_DEBUG === 'true';
    
    // Validate required fields
    if (!answers.email || !answers.full_name) {
      if (debugMode) {
        console.error("Missing required fields for HighLevel sync:", { 
          hasEmail: !!answers.email, 
          hasName: !!answers.full_name 
        });
      }
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    if (debugMode) {
      console.log("Processing HighLevel sync for:", answers.email);
    }
    const result = await pushToHighLevel(answers as any);
    
    if (result?.success) {
      return NextResponse.json({ 
        ok: true, 
        message: `Contact ${result.action} in HighLevel successfully`,
        contactId: result.contactId,
        action: result.action
      });
    } else {
      // Handle different types of failures appropriately
      if (debugMode) {
        console.error("HighLevel sync failed:", result?.error);
      }
      
      // Missing credentials should be 400, not 500
      if (result?.error === "Missing credentials") {
        return NextResponse.json({ 
          ok: false, 
          error: "HighLevel credentials not configured",
          message: "Please set HL_API_KEY and HL_LOCATION_ID in .env.local",
          details: "Quiz will continue without HighLevel sync"
        }, { status: 400 });
      }
      
      // Authentication/authorization errors
      if (result?.status === 401 || result?.status === 403) {
        return NextResponse.json({ 
          ok: false, 
          error: result.error,
          message: "HighLevel authentication failed - check API credentials",
          details: "Quiz will continue without HighLevel sync"
        }, { status: result.status });
      }
      
      // Other API errors
      return NextResponse.json({ 
        ok: false, 
        error: result?.error || "Unknown error",
        message: "HighLevel sync failed, but quiz will continue",
        details: result?.status ? `HTTP ${result.status}` : "Unknown error"
      }, { status: result?.status || 500 });
    }
  } catch (err) {
    const debugMode = process.env.HL_DEBUG === 'true';
    if (debugMode) {
    console.error("/api/highlevel error", err);
    }
    return new NextResponse("HighLevel sync failed", { status: 500 });
  }
} 