import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const bodySchema = z.object({
  context: z.enum(["review", "product"]).default("review"),
});

const FOLDER_BY_CONTEXT = {
  review: "woozi/reviews",
  product: "woozi/products",
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
  const { context } = parsed.data;

  // Review photos: any signed-in user. Product photos: admin only.
  const { user, response } = context === "product" ? await requireAdmin() : await requireUser();
  if (!user) return response;

  const signature = generateUploadSignature(FOLDER_BY_CONTEXT[context]);
  return NextResponse.json(signature);
}
