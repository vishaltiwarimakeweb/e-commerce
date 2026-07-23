import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const signature = generateUploadSignature("woozi/reviews");
  return NextResponse.json(signature);
}
