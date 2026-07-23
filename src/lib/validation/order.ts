import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.string().length(24, "Select a delivery address."),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
