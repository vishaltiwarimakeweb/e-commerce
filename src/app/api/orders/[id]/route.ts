import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getOrder } from "@/lib/orders";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const order = await getOrder(user.id, id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
