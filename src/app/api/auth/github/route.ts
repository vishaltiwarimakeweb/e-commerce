import { NextResponse } from "next/server";
import { getGithubAuthUrl } from "@/lib/oauth/github";
import { generateOAuthState, OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE } from "@/lib/oauth/state";

export async function GET() {
  const state = generateOAuthState();
  const response = NextResponse.redirect(getGithubAuthUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  });
  return response;
}
