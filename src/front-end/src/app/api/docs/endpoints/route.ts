import { NextRequest, NextResponse } from "next/server";
import { swaggerSpec } from "@/utils/swagger";

export async function GET(req: NextRequest) {
  return NextResponse.json(swaggerSpec);
}
