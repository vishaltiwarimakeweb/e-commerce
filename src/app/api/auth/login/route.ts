import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/password";
import { signSession } from "@/lib/jwt";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, toAuthUser } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { email, password } = parsed.data;

  await connectToDatabase();

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await signSession({ sub: user._id.toString(), isAdmin: user.isAdmin });

  const response = NextResponse.json({ user: toAuthUser(user) });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
