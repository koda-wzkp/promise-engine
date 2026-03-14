import { NextResponse } from "next/server";
import { DF_DASHBOARD } from "@/lib/data/dodd-frank-2010";

export async function GET() {
  return NextResponse.json(DF_DASHBOARD);
}
