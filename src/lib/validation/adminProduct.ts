import { z } from "zod";

export const adminProductSchema = z.object({
  title: z.string().trim().min(2).max(140),
  shortDescription: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(5000),
  images: z.array(z.string().url()).min(1, "At least one image is required."),
  price: z.coerce.number().int().min(0, "Price must be a positive number of cents."),
  category: z.string().trim().min(1).max(60),
  tags: z.array(z.string().trim().min(1)).default([]),
  stock: z.coerce.number().int().min(0).default(0),
});
export type AdminProductInput = z.infer<typeof adminProductSchema>;

export const adminProductListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(50),
});
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
