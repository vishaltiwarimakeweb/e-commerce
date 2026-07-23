import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import type { Address } from "@/models/User";

export type PaymentMode = "COD" | "Online";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type DeliveryStatus = "On the way" | "Delivered";

export interface OrderItem {
  product: Types.ObjectId;
  title: string;
  thumbnail: string;
  price: number; // cents, snapshotted at order time
  quantity: number;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  totalAmount: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  estimatedDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

// Embedded snapshot — deliberately not a ref, so later edits to the user's
// saved addresses never change what a past order says was shipped where.
const shippingAddressSchema = new Schema<Address>(
  {
    label: { type: String, enum: ["Home", "Work", "Other"], required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ["COD", "Online"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    deliveryStatus: { type: String, enum: ["On the way", "Delivered"], default: "On the way" },
    estimatedDeliveryDate: { type: Date, required: true },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });

export const Order: Model<OrderDocument> = models.Order ?? model<OrderDocument>("Order", orderSchema);
