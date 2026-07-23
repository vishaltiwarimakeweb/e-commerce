import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { productQuerySchema } from "@/lib/validation/product";

export async function GET(request: NextRequest) {
  const parsed = productQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters." }, { status: 400 });
  }

  const result = await getProducts(parsed.data);
  return NextResponse.json(result);
}
