import type { OAuthProfile } from "@/types/auth";

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth env vars are not set.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = config();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, redirectUri } = config();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Failed to exchange the Google authorization code.");
  }
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    throw new Error("Failed to fetch the Google profile.");
  }
  const profile = (await profileRes.json()) as { sub: string; email: string; name: string };

  return { providerId: profile.sub, email: profile.email, name: profile.name };
}
