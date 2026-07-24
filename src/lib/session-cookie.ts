// Kept separate from lib/auth.ts (which pulls in Mongoose) so cookie name/options
// can be imported without dragging in Node-only deps.
export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
};
