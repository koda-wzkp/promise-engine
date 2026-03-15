import { NextResponse } from "next/server";

// API route for processing check-ins.
// In the static export build, check-ins go directly through Supabase client.
// This route exists for server-side processing if needed (e.g., web-only mode).

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, promiseId, date, response, reflection } = body;

    if (!userId || !promiseId || !date || !response) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "Required fields missing" } },
        { status: 400 }
      );
    }

    if (!["kept", "partial", "missed"].includes(response)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_RESPONSE", message: "Response must be kept, partial, or missed" } },
        { status: 400 }
      );
    }

    // In static export mode, this route is not used.
    // Client-side code calls Supabase directly.
    return NextResponse.json({ success: true, result: { message: "Use client-side Supabase" } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal error" } },
      { status: 500 }
    );
  }
}
