import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import type { AdminProductInput, AdminProductListQuery } from "@/lib/validation/adminProduct";

export interface AdminProductListItem {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
}

export interface AdminProductListResult {
  products: AdminProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Unlike the public catalog query, this intentionally includes inactive
// (soft-deleted) products so the admin can see/restore them.
export async function listAllProducts(query: AdminProductListQuery): Promise<AdminProductListResult> {
  await connectToDatabase();
  const { q, page, limit } = query;

  const filter = q ? { $text: { $search: q } } : {};
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select("title images price category stock isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: products.map((product) => ({
      _id: product._id.toString(),
      title: product.title,
      thumbnail: product.images[0],
      price: product.price,
      category: product.category,
      stock: product.stock,
      isActive: product.isActive,
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export interface AdminProductDetail extends AdminProductInput {
  _id: string;
  isActive: boolean;
}

// Ignores isActive (unlike the public getProductById) so the admin can edit
// a soft-deleted product too.
export async function getProductForEdit(id: string): Promise<AdminProductDetail | null> {
  await connectToDatabase();
  const product = await Product.findById(id).lean();
  if (!product) return null;

  return {
    _id: product._id.toString(),
    title: product.title,
    shortDescription: product.shortDescription,
    description: product.description,
    images: product.images,
    price: product.price,
    category: product.category,
    tags: product.tags,
    stock: product.stock,
    isActive: product.isActive,
  };
}

export async function createProduct(data: AdminProductInput): Promise<{ id: string }> {
  await connectToDatabase();
  const product = await Product.create(data);
  return { id: product._id.toString() };
}

export async function updateProduct(id: string, data: AdminProductInput): Promise<boolean> {
  await connectToDatabase();
  const result = await Product.findByIdAndUpdate(id, { $set: data }, { runValidators: true });
  return Boolean(result);
}

// Soft delete — keeps past orders/reviews referencing this product intact.
export async function setProductActive(id: string, isActive: boolean): Promise<boolean> {
  await connectToDatabase();
  const result = await Product.findByIdAndUpdate(id, { $set: { isActive } });
  return Boolean(result);
}
