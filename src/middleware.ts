import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  // If access token is valid, continue
  if (accessToken && verifyAccessToken(accessToken)) {
    return NextResponse.next();
  }

  // No valid access token, redirect to login
  // Let the client handle token refresh on the login page or via API calls
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
