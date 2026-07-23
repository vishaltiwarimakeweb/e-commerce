import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/types/auth";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days, matches the session cookie's maxAge

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ isAdmin: payload.isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.isAdmin !== "boolean") {
      return null;
    }
    return { sub: payload.sub, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}
