import { NextResponse } from "next/server";

// API route for recomputing garden state from source data.
// In static export mode, garden state is computed client-side.
// This route exists for server-side recomputation if needed.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_USER", message: "userId required" } },
        { status: 400 }
      );
    }

    // In static export mode, this route is not used.
    return NextResponse.json({ success: true, result: { message: "Use client-side computation" } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal error" } },
      { status: 500 }
    );
  }
}
