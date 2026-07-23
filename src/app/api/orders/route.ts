import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { placeOrder, listOrders } from "@/lib/orders";
import { placeOrderSchema } from "@/lib/validation/order";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const orders = await listOrders(user.id);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = placeOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const order = await placeOrder(user.id, parsed.data.addressId);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't place your order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
