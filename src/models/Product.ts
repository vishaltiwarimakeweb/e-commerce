import mongoose, { type Document, type Model } from "mongoose";

// Destructured off the default export (not named imports) — mongoose is CommonJS,
// and the eve agent runtime's stricter ESM interop can't see named exports like
// `models` that Next.js's bundler synthesizes for us. This form works under both.
const { Schema, model, models } = mongoose;

export interface ProductDocument extends Document {
  title: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number; // integer cents
  category: string;
  tags: string[];
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "A product needs at least one image.",
      },
    },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ title: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export const Product: Model<ProductDocument> =
  models.Product ?? model<ProductDocument>("Product", productSchema);
