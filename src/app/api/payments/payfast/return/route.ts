import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") ?? "";
  const url = new URL("/checkout/result", process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin);
  url.searchParams.set("status", "paid");
  if (ref) url.searchParams.set("ref", ref);
  return NextResponse.redirect(url);
}
