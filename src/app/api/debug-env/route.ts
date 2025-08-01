import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasHL_API_KEY: !!process.env.HL_API_KEY,
    hasHL_LOCATION_ID: !!process.env.HL_LOCATION_ID,
    HL_DEBUG: process.env.HL_DEBUG,
    // Don't expose actual values for security
    HL_API_KEY_length: process.env.HL_API_KEY?.length || 0,
    HL_API_KEY_starts_with: process.env.HL_API_KEY?.substring(0, 3) || 'not_set',
    HL_LOCATION_ID_length: process.env.HL_LOCATION_ID?.length || 0,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    status: 'ok',
    environment: envCheck,
    message: envCheck.hasHL_API_KEY && envCheck.hasHL_LOCATION_ID 
      ? 'HighLevel credentials are configured' 
      : 'HighLevel credentials are missing'
  });
} 