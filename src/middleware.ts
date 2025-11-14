// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Path:", request.nextUrl.pathname);
  console.log("Access token exists:", !!accessToken);
  console.log("Access token value:", accessToken?.substring(0, 20) + "..."); // Log first 20 chars

  // If access token is valid, continue
  if (accessToken) {
    try {
      const isValid = verifyAccessToken(accessToken);
      console.log("Token verification result:", isValid);

      if (isValid) {
        console.log("✅ Token valid, allowing access");
        return NextResponse.next();
      }
    } catch (error) {
      console.error("❌ Token verification error:", error);
    }
  }

  console.log("🔄 Redirecting to /signin");
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
