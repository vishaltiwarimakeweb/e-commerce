import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { profileUpdateSchema } from "@/lib/validation/profile";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const profile = await getProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const profile = await updateProfile(user.id, parsed.data);
  return NextResponse.json({ profile });
}
