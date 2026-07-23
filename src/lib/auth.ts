import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifySession } from "@/lib/jwt";
import { User, type UserDocument } from "@/models/User";
import type { AuthUser } from "@/types/auth";

// Strips sensitive/internal fields before a user document ever reaches the client.
export function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };
}

export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
};

// Reads the session cookie, verifies it, and loads the current user. Returns
// null if there's no cookie, the token is invalid/expired, or the user was deleted.
export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  await connectToDatabase();
  const user = await User.findById(payload.sub).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };
}

// Route-handler guard: returns the current user, or a ready-to-return 401 response.
export async function requireUser(): Promise<
  { user: AuthUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }),
    };
  }
  return { user, response: null };
}
