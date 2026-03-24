import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let data: {
    name?: string;
    organization?: string;
    email?: string;
    type?: string;
    description?: string;
    referral?: string;
  };

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.name || !data.email || !data.type || !data.description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  const summary = `
Name: ${data.name}
Organization: ${data.organization || "Not provided"}
Email: ${data.email}
Type: ${data.type}
Description: ${data.description}
Referral: ${data.referral || "Not provided"}
Submitted: ${new Date().toISOString()}
  `.trim();

  // Option A: Send via Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Promise Pipeline <noreply@promisepipeline.com>",
        to: "plecodev@pm.me",
        subject: `New inquiry: ${data.name} — ${data.type}`,
        text: summary,
      });

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send" },
        { status: 500 }
      );
    }
  }

  // Option B: Console log fallback
  console.log("[SERVICE INQUIRY]", summary);
  return NextResponse.json({ ok: true });
}
