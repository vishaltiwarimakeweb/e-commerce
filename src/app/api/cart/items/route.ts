import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addItem } from "@/lib/cart";
import { addCartItemSchema } from "@/lib/validation/cart";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = addCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const cart = await addItem(user.id, parsed.data.productId, parsed.data.quantity);
    return NextResponse.json({ cart });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't add that item to your cart.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
