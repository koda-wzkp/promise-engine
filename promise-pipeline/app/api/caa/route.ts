import { NextResponse } from "next/server";
import { CAA_DASHBOARD } from "@/lib/data/caa-1990";

export async function GET() {
  return NextResponse.json(CAA_DASHBOARD);
}
