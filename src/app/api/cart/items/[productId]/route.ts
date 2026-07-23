import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { setItemQuantity, removeItem } from "@/lib/cart";
import { updateCartItemSchema } from "@/lib/validation/cart";

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { productId } = await params;

  const body = await request.json();
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const cart = await setItemQuantity(user.id, productId, parsed.data.quantity);
    return NextResponse.json({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't update that item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { productId } = await params;

  const cart = await removeItem(user.id, productId);
  return NextResponse.json({ cart });
}
