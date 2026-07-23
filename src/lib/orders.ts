import { connectToDatabase } from "@/lib/db";
import { Order, type OrderDocument } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { Cart } from "@/models/Cart";
import { getCart } from "@/lib/cart";
import type { Address } from "@/models/User";

const ESTIMATED_DELIVERY_DAYS = 5;

export interface OrderData {
  id: string;
  items: { productId: string; title: string; thumbnail: string; price: number; quantity: number }[];
  shippingAddress: Address;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  deliveryStatus: string;
  estimatedDeliveryDate: string;
  createdAt: string;
}

function serialize(order: OrderDocument): OrderData {
  return {
    id: order._id.toString(),
    items: order.items.map((item) => ({
      productId: item.product.toString(),
      title: item.title,
      thumbnail: item.thumbnail,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    paymentMode: order.paymentMode,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    estimatedDeliveryDate: order.estimatedDeliveryDate.toISOString(),
    createdAt: order.createdAt.toISOString(),
  };
}

// Places an order from the user's current cart. Stock is decremented with a
// guarded update per item (stock >= quantity) rather than a DB transaction —
// simpler and doesn't require a replica-set deployment; if a later item in
// the loop fails the guard, the earlier decrements in this same order are
// compensated (added back) before returning the error.
export async function placeOrder(userId: string, addressId: string): Promise<OrderData> {
  await connectToDatabase();

  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const user = await User.findById(userId).select("addresses");
  const address = user?.addresses.id(addressId);
  if (!address) {
    throw new Error("Select a valid delivery address.");
  }

  const decremented: { productId: string; quantity: number }[] = [];
  try {
    for (const item of cart.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
      if (!updated) {
        throw new Error(`"${item.title}" no longer has enough stock. Update your cart and try again.`);
      }
      decremented.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (error) {
    for (const item of decremented) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    throw error;
  }

  const estimatedDeliveryDate = new Date(Date.now() + ESTIMATED_DELIVERY_DAYS * 24 * 60 * 60 * 1000);

  const order = await Order.create({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.productId,
      title: item.title,
      thumbnail: item.thumbnail,
      price: item.price,
      quantity: item.quantity,
    })),
    // Order's shippingAddress schema only defines label/fullName/.../country
    // (no isDefault), so Mongoose's default strict-mode casting drops the
    // rest of the User.addresses subdocument automatically.
    shippingAddress: address.toObject(),
    totalAmount: cart.subtotal,
    estimatedDeliveryDate,
  });

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  return serialize(order);
}

export async function listOrders(userId: string): Promise<OrderData[]> {
  await connectToDatabase();
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders.map(serialize);
}

export async function getOrder(userId: string, orderId: string): Promise<OrderData | null> {
  await connectToDatabase();
  const order = await Order.findOne({ _id: orderId, user: userId });
  return order ? serialize(order) : null;
}
