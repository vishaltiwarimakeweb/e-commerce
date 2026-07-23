import type { QueryFilter, SortOrder } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Product, type ProductDocument } from "@/models/Product";
import type { ProductQuery } from "@/lib/validation/product";

const SORT_MAP: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { title: 1 },
  name_desc: { title: -1 },
};

export interface ProductListItem {
  _id: string;
  title: string;
  shortDescription: string;
  images: string[];
  price: number;
  category: string;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  stock: number;
}

export interface ProductListResult {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: string[];
}

// Shared by the catalog page (SSR) and the /api/products route — one query implementation.
export async function getProducts(query: ProductQuery): Promise<ProductListResult> {
  const { q, category, minPrice, maxPrice, tags, sort, page, limit } = query;

  await connectToDatabase();

  const filter: QueryFilter<ProductDocument> = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (tags) filter.tags = { $in: tags.split(",").map((tag) => tag.trim()) };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [products, total, categories] = await Promise.all([
    Product.find(filter)
      .select("title shortDescription images price category tags ratingAverage ratingCount stock")
      .sort(SORT_MAP[sort])
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
    Product.distinct("category", { isActive: true }),
  ]);

  return {
    products: products.map((product) => ({
      _id: product._id.toString(),
      title: product.title,
      shortDescription: product.shortDescription,
      images: product.images,
      price: product.price,
      category: product.category,
      tags: product.tags,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      stock: product.stock,
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    categories,
  };
}
