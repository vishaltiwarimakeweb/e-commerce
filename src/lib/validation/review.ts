import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick at least 1 star.").max(5),
  description: z.string().trim().max(2000).optional(),
  images: z.array(z.string().url()).max(5, "Up to 5 images per review.").optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
