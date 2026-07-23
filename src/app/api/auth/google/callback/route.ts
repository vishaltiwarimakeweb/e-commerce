import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleProfile } from "@/lib/oauth/google";
import { OAUTH_STATE_COOKIE } from "@/lib/oauth/state";
import { findOrCreateOAuthUser } from "@/lib/oauth/login";
import { signSession } from "@/lib/jwt";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${appUrl}/sign-in?error=oauth_failed`);
  }

  try {
    const profile = await fetchGoogleProfile(code);
    const user = await findOrCreateOAuthUser(profile, "google");
    const token = await signSession({ sub: user._id.toString(), isAdmin: user.isAdmin });

    const response = NextResponse.redirect(appUrl);
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    response.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  } catch {
    return NextResponse.redirect(`${appUrl}/sign-in?error=oauth_failed`);
  }
}
