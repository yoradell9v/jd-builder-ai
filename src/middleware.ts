// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken); // ✅ Now awaiting
    if (decoded) {
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/saved/:path*"],
};
