import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listAllProducts, createProduct } from "@/lib/adminProducts";
import { adminProductSchema, adminProductListQuerySchema } from "@/lib/validation/adminProduct";

export async function GET(request: Request) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const parsed = adminProductListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters." }, { status: 400 });
  }

  const result = await listAllProducts(parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { user, response } = await requireAdmin();
  if (!user) return response;

  const body = await request.json();
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const created = await createProduct(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
