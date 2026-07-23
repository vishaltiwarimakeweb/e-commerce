import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const cart = await getCart(user.id);
  return NextResponse.json({ cart });
}
