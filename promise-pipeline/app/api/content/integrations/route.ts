import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.POSTIZ_API_URL;
  const apiKey = process.env.POSTIZ_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "Postiz not configured. Set POSTIZ_API_URL and POSTIZ_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${apiUrl}/integrations`, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "postiz_error", details: errorText },
        { status: response.status }
      );
    }

    const integrations = await response.json();
    return NextResponse.json(integrations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Postiz" },
      { status: 502 }
    );
  }
}
