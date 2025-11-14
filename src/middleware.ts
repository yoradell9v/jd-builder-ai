// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  console.log("=== MIDDLEWARE RUNNING ===");
  console.log("Path:", request.nextUrl.pathname);
  console.log("All cookies:", request.cookies.getAll());

  const accessToken = request.cookies.get("accessToken")?.value;

  console.log("Access token exists:", !!accessToken);
  console.log("Access token (first 50 chars):", accessToken?.substring(0, 50));
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log(
    "JWT_SECRET (first 10 chars):",
    process.env.JWT_SECRET?.substring(0, 10)
  );

  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      console.log("Verification result:", decoded);

      if (decoded) {
        console.log("✅ TOKEN VALID - Allowing access");
        return NextResponse.next();
      } else {
        console.log("❌ TOKEN INVALID - verifyAccessToken returned null");
      }
    } catch (error) {
      console.error("❌ ERROR during verification:", error);
    }
  } else {
    console.log("❌ NO ACCESS TOKEN FOUND");
  }

  console.log("🔄 REDIRECTING TO /signin");
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
