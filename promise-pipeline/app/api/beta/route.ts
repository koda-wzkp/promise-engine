import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string };
    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // In production, store to database or email service
    console.log("Beta signup:", body.email);

    return NextResponse.json({ success: true, message: "Thanks for signing up!" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
