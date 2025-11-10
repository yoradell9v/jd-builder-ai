import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // If access token is valid, continue
  if (accessToken && verifyAccessToken(accessToken)) {
    return NextResponse.next();
  }

  // If access token expired but refresh token exists, try to refresh
  if (refreshToken) {
    const response = await fetch(
      new URL("/api/auth/refresh", request.url).toString(),
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      }
    );

    if (response.ok) {
      const newResponse = NextResponse.next();
      
      // Copy the new access token cookie
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        newResponse.headers.set("set-cookie", setCookie);
      }
      
      return newResponse;
    }
  }

  // No valid tokens, redirect to login
  return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Protected routes
};
