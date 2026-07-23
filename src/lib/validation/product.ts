import { z } from "zod";

export const productSortOptions = ["newest", "price_asc", "price_desc", "name_asc", "name_desc"] as const;
export type ProductSort = (typeof productSortOptions)[number];

export const productQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional().catch(undefined),
  maxPrice: z.coerce.number().int().min(0).optional().catch(undefined),
  tags: z.string().trim().min(1).optional(), // comma-separated
  sort: z.enum(productSortOptions).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(48).catch(16),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;
