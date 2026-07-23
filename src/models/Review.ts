import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ReviewDocument extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String },
    images: { type: [String], default: [] },
  },
  { timestamps: true },
);

// One review per user per product — re-submitting updates the existing review.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review: Model<ReviewDocument> =
  models.Review ?? model<ReviewDocument>("Review", reviewSchema);
