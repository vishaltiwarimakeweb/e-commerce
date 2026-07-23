import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifySession } from "@/lib/jwt";
import { User, type UserDocument } from "@/models/User";
import type { AuthUser } from "@/types/auth";

import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session-cookie";
export { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS };

// Strips sensitive/internal fields before a user document ever reaches the client.
export function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };
}

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

// Same as requireUser(), but also enforces isAdmin — 403 (not 401) for a
// signed-in non-admin, since they're authenticated, just not authorized.
export async function requireAdmin(): Promise<
  { user: AuthUser; response: null } | { user: null; response: NextResponse }
> {
  const { user, response } = await requireUser();
  if (!user) return { user: null, response };
  if (!user.isAdmin) {
    return {
      user: null,
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }
  return { user, response: null };
}
