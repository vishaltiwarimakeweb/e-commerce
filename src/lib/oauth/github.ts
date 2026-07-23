import type { OAuthProfile } from "@/types/auth";

function config() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("GitHub OAuth env vars are not set.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getGithubAuthUrl(state: string): string {
  const { clientId, redirectUri } = config();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function fetchGithubProfile(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, redirectUri } = config();

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Failed to exchange the GitHub authorization code.");
  }
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
  if (!accessToken) {
    throw new Error("GitHub did not return an access token.");
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };

  const profileRes = await fetch("https://api.github.com/user", { headers });
  if (!profileRes.ok) {
    throw new Error("Failed to fetch the GitHub profile.");
  }
  const profile = (await profileRes.json()) as { id: number; name: string | null; login: string; email: string | null };

  // GitHub only includes `email` on /user when it's public — fall back to the emails endpoint.
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails.find((e) => e.verified)?.email ?? null;
    }
  }
  if (!email) {
    throw new Error("Your GitHub account has no verified email address to sign in with.");
  }

  return { providerId: String(profile.id), email, name: profile.name ?? profile.login };
}
