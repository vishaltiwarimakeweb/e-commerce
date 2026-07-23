import { randomBytes } from "crypto";

// Short-lived cookie used to protect the OAuth redirect against CSRF —
// the callback rejects the flow unless the `state` query param matches this cookie.
export const OAUTH_STATE_COOKIE = "oauth_state";
export const OAUTH_STATE_MAX_AGE = 5 * 60; // 5 minutes, in seconds

export function generateOAuthState(): string {
  return randomBytes(16).toString("hex");
}
