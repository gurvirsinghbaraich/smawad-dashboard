import { NextResponse } from "next/server";

export function generateUnauthorizedResponse() {
  return NextResponse.json(
    {
      status: "Unauthorized",
    },
    {
      status: 401,
    },
  );
}
