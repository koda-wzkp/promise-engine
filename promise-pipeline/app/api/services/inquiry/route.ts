import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface InquiryPayload {
  name?: string;
  organization?: string;
  email?: string;
  category?: string;
  description?: string;
  scope?: string;
  referral?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InquiryPayload;

    // Validate required fields
    if (!body.name || !body.organization || !body.email || !body.category || !body.description) {
      return NextResponse.json(
        { error: "Name, organization, email, category, and description are required." },
        { status: 400 },
      );
    }

    if (!body.email.includes("@") || !body.email.includes(".")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const inquiry = {
      ...body,
      submittedAt: new Date().toISOString(),
    };

    // Store to local JSON file
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });

      let existing: unknown[] = [];
      try {
        const raw = await fs.readFile(INQUIRIES_FILE, "utf-8");
        existing = JSON.parse(raw);
      } catch {
        // File doesn't exist yet
      }

      existing.push(inquiry);
      await fs.writeFile(INQUIRIES_FILE, JSON.stringify(existing, null, 2));
    } catch (fsErr) {
      console.error("Failed to write inquiry to disk:", fsErr);
      // Don't fail the request — log it and continue
    }

    console.log("New service inquiry:", inquiry);

    return NextResponse.json({
      success: true,
      message: `Thanks, ${body.name}. We'll be in touch within 2 business days.`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
