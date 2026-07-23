import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";

export interface ReviewListItem {
  _id: string;
  rating: number;
  description?: string;
  images: string[];
  createdAt: string;
  user: { name: string };
}

export async function getProductReviews(productId: string): Promise<ReviewListItem[]> {
  await connectToDatabase();
  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .populate<{ user: { name: string } }>("user", "name")
    .lean();

  return reviews.map((review) => ({
    _id: review._id.toString(),
    rating: review.rating,
    description: review.description,
    images: review.images,
    createdAt: review.createdAt.toISOString(),
    user: { name: review.user?.name ?? "Woozi shopper" },
  }));
}

// Denormalized onto Product so catalog/product pages never aggregate reviews on read.
export async function recomputeProductRating(productId: string): Promise<void> {
  const [stats] = await Review.aggregate<{ average: number; count: number }>([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats ? Math.round(stats.average * 10) / 10 : 0,
    ratingCount: stats?.count ?? 0,
  });
}
