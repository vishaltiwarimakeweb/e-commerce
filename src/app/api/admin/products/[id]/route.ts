import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getProductForEdit, updateProduct } from "@/lib/adminProducts";
import { adminProductSchema } from "@/lib/validation/adminProduct";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAdmin();
  if (!user) return response;
  const { id } = await params;

  const product = await getProductForEdit(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAdmin();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json();
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await updateProduct(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
