import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, organization, email, category, description, scope, referral } = data;

    if (!name || !organization || !email || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Promise Pipeline <onboarding@resend.dev>",
      to: "conor@pleco.dev",
      replyTo: email,
      subject: `New inquiry: ${organization} — ${category}`,
      html: `
        <h2>New Promise Pipeline Inquiry</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: sans-serif;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Name</td>
            <td style="padding: 8px 12px;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Organization</td>
            <td style="padding: 8px 12px;">${organization}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Category</td>
            <td style="padding: 8px 12px;">${category}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Description</td>
            <td style="padding: 8px 12px;">${description}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Estimated Scope</td>
            <td style="padding: 8px 12px;">${scope || "Not specified"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #4b5563;">Referral</td>
            <td style="padding: 8px 12px;">${referral || "Not specified"}</td>
          </tr>
        </table>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json(
      { error: "Failed to send inquiry" },
      { status: 500 }
    );
  }
}
