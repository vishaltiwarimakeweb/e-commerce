import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { signSession } from "@/lib/jwt";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, toAuthUser } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  await connectToDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = await User.create({
    name,
    email,
    password: await hashPassword(password),
    authProvider: "credentials",
  });

  const token = await signSession({ sub: user._id.toString(), isAdmin: user.isAdmin });

  const response = NextResponse.json({ user: toAuthUser(user) }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
