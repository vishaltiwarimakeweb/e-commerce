import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Cart, type CartDocument } from "@/models/Cart";
import { Product } from "@/models/Product";

export interface CartLineItem {
  productId: string;
  title: string;
  thumbnail: string;
  price: number; // cents, always read live from Product — never snapshotted in the cart
  quantity: number;
  stock: number;
  lineTotal: number;
}

export interface CartData {
  items: CartLineItem[];
  subtotal: number;
  itemCount: number;
}

async function getOrCreateCartDoc(userId: string): Promise<CartDocument> {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true },
  );
  return cart;
}

// Prices/titles/stock are read live from Product on every call — the cart
// only ever stores { product, quantity }.
export async function getCart(userId: string): Promise<CartData> {
  await connectToDatabase();
  const cart = await Cart.findOne({ user: userId }).lean();
  const items = cart?.items ?? [];
  if (items.length === 0) return { items: [], subtotal: 0, itemCount: 0 };

  const products = await Product.find({ _id: { $in: items.map((item) => item.product) } })
    .select("title images price stock")
    .lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const lineItems: CartLineItem[] = [];
  for (const item of items) {
    const product = productMap.get(item.product.toString());
    if (!product) continue; // product deleted/deactivated since it was added — skip defensively
    lineItems.push({
      productId: product._id.toString(),
      title: product.title,
      thumbnail: product.images[0],
      price: product.price,
      quantity: item.quantity,
      stock: product.stock,
      lineTotal: product.price * item.quantity,
    });
  }

  return {
    items: lineItems,
    subtotal: lineItems.reduce((sum, item) => sum + item.lineTotal, 0),
    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function addItem(userId: string, productId: string, quantity: number): Promise<CartData> {
  await connectToDatabase();
  const product = await Product.findOne({ _id: productId, isActive: true }).select("stock");
  if (!product) throw new Error("Product not found.");
  if (product.stock <= 0) throw new Error("This product is out of stock.");

  const cart = await getOrCreateCartDoc(userId);
  const existing = cart.items.find((item) => item.product.toString() === productId);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock);

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity: nextQuantity });
  }
  await cart.save();
  return getCart(userId);
}

export async function setItemQuantity(userId: string, productId: string, quantity: number): Promise<CartData> {
  await connectToDatabase();
  const cart = await getOrCreateCartDoc(userId);
  const index = cart.items.findIndex((item) => item.product.toString() === productId);
  if (index === -1) throw new Error("That item isn't in your cart.");

  if (quantity <= 0) {
    cart.items.splice(index, 1);
  } else {
    const product = await Product.findById(productId).select("stock");
    cart.items[index].quantity = Math.min(quantity, product?.stock ?? quantity);
  }
  await cart.save();
  return getCart(userId);
}

export async function removeItem(userId: string, productId: string): Promise<CartData> {
  await connectToDatabase();
  const cart = await getOrCreateCartDoc(userId);
  const index = cart.items.findIndex((item) => item.product.toString() === productId);
  if (index !== -1) {
    cart.items.splice(index, 1);
    await cart.save();
  }
  return getCart(userId);
}
