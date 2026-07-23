import { connectToDatabase } from "@/lib/db";
import { User, type UserDocument } from "@/models/User";
import type { AuthProvider, OAuthProfile } from "@/types/auth";

// Matches OAuth identities to accounts by email — if that email is already
// registered (however it originally signed up), the OAuth login authenticates
// as that existing user instead of creating a duplicate account.
export async function findOrCreateOAuthUser(
  profile: OAuthProfile,
  provider: AuthProvider,
): Promise<UserDocument> {
  await connectToDatabase();

  const existing = await User.findOne({ email: profile.email });
  if (existing) return existing;

  return User.create({
    name: profile.name,
    email: profile.email,
    authProvider: provider,
    providerId: profile.providerId,
  });
}
