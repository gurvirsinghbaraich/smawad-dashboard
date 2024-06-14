import { NextResponse } from "next/server";

export function JsonResponse(payload: any, init?: RequestInit): NextResponse {
  return NextResponse.json(payload, init);
}
