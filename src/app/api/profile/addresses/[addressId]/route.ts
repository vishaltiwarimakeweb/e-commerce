import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { updateAddress, deleteAddress } from "@/lib/profile";
import { addressSchema } from "@/lib/validation/profile";

export async function PATCH(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { addressId } = await params;

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const profile = await updateAddress(user.id, addressId, parsed.data);
  if (!profile) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { addressId } = await params;

  const profile = await deleteAddress(user.id, addressId);
  if (!profile) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }
  return NextResponse.json({ profile });
}
