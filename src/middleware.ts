import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

// Profile/Cart/Orders/Checkout require a signed-in user — redirect to sign-in
// otherwise, preserving where they were headed so we can send them back after login.

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !session.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};
