import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addAddress } from "@/lib/profile";
import { addressSchema } from "@/lib/validation/profile";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const profile = await addAddress(user.id, parsed.data);
  return NextResponse.json({ profile }, { status: 201 });
}
