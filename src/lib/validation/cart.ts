import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().length(24, "Invalid product id."),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(20),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
