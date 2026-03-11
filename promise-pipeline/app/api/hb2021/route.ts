import { NextResponse } from "next/server";
import { HB2021_DASHBOARD } from "@/lib/data/hb2021";

export async function GET() {
  return NextResponse.json(HB2021_DASHBOARD);
}
