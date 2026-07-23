// Kept separate from lib/auth.ts (which pulls in Mongoose) so middleware.ts,
// which runs on the Edge runtime, can import just this without Node-only deps.
export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
};
