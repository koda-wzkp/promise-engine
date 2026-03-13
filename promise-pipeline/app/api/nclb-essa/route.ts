import { NextResponse } from "next/server";
import { NCLB_DASHBOARD } from "@/lib/data/nclb-essa";

export async function GET() {
  return NextResponse.json(NCLB_DASHBOARD);
}
