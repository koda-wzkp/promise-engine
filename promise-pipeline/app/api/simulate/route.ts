import { NextRequest, NextResponse } from "next/server";
import { HB2021_DASHBOARD } from "@/lib/data/hb2021";
import { simulateCascade } from "@/lib/simulation/cascade";
import { WhatIfQuery } from "@/lib/types/simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as WhatIfQuery;
    if (!body.promiseId || !body.newStatus) {
      return NextResponse.json({ error: "promiseId and newStatus required" }, { status: 400 });
    }

    const result = simulateCascade(HB2021_DASHBOARD.promises, body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
