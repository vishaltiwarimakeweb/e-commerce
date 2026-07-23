import { Schema, model, models, Types, type Document, type Model } from "mongoose";
import type { AuthProvider } from "@/types/auth";

export interface Address {
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  authProvider: AuthProvider;
  providerId?: string;
  age?: number;
  phone?: string;
  isAdmin: boolean;
  addresses: Types.DocumentArray<Address>;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
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
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    providerId: { type: String },
    age: { type: Number },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true },
);

userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ providerId: 1, authProvider: 1 });

export const User: Model<UserDocument> = models.User ?? model<UserDocument>("User", userSchema);
