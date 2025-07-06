import { NextRequest, NextResponse } from "next/server";
import { pushToHighLevel } from "@/lib/highLevelService";

export async function POST(req: NextRequest) {
  try {
    const answers = (await req.json()) as any;
    await pushToHighLevel(answers as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/highlevel error", err);
    return new NextResponse("HighLevel sync failed", { status: 500 });
  }
} 