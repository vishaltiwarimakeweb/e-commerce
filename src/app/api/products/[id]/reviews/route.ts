import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation/review";
import { recomputeProductRating, getProductReviews } from "@/lib/reviews";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const reviews = await getProductReviews(id);
  return NextResponse.json({ reviews });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectToDatabase();

  const product = await Product.findOne({ _id: id, isActive: true }).select("_id");
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // One review per user per product (unique index) — resubmitting updates it in place.
  const review = await Review.findOneAndUpdate(
    { product: id, user: user.id },
    { $set: parsed.data },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate("user", "name");

  await recomputeProductRating(id);

  return NextResponse.json({ review });
}
