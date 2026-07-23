import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface CartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface CartDocument extends Document {
  user: Types.ObjectId;
  items: Types.DocumentArray<CartItem>;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema<CartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart: Model<CartDocument> = models.Cart ?? model<CartDocument>("Cart", cartSchema);
