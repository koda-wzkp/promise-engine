import { NextRequest, NextResponse } from "next/server";
import { generateTrainingExports } from "@/lib/pipeline/generate-exports";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const billId = searchParams.get("bill");

  const result = generateTrainingExports();

  if (billId) {
    const match = result.exports.find((e) => e.bill_id === billId);
    if (!match) {
      return NextResponse.json(
        { error: `Bill not found: ${billId}` },
        { status: 404 },
      );
    }
    return NextResponse.json(match.data);
  }

  // Return all exports
  return NextResponse.json(result.exports.map((e) => e.data));
}
