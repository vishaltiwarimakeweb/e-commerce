export type AuthProvider = "credentials" | "google" | "github";

// Claims stored inside the signed session JWT.
export interface SessionPayload {
  sub: string; // User _id
  isAdmin: boolean;
}

// Safe-to-send-to-the-client shape of a user (never includes the password hash).
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Identity resolved from an OAuth provider after exchanging the authorization code.
export interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
}
