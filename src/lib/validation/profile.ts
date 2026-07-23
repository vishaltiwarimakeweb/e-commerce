import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  age: z.coerce.number().int().min(13).max(120).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(80),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;
