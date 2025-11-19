import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET!);

if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
  throw new Error("JWT secrets not configured");
}

export interface TokenPayload {
  userId: string;
  email: string;
}

// Extend JWTPayload to include our custom claims
interface CustomJWTPayload extends JWTPayload {
  userId: string;
  email: string;
}

// Generate short-lived access token (15 minutes)
export async function generateAccessToken(
  payload: TokenPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

// Generate long-lived refresh token (7 days)
export async function generateRefreshToken(
  payload: TokenPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

// Verify access token
export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify<CustomJWTPayload>(token, JWT_SECRET);
    return {
      userId: verified.payload.userId,
      email: verified.payload.email,
    };
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

// Verify refresh token
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify<CustomJWTPayload>(token, REFRESH_SECRET);
    return {
      userId: verified.payload.userId,
      email: verified.payload.email,
    };
  } catch (error: any) {
    console.error("Refresh token verification failed:", error.message);
    return null;
  }
}