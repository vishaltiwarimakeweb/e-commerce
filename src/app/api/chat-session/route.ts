import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getChatSessionPointer, saveChatSessionPointer } from "@/lib/chatSession";
import { chatSessionPointerSchema } from "@/lib/validation/chatSession";

// GET: fetch the signed-in user's cross-device ShopWise session pointer, if any.
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const pointer = await getChatSessionPointer(user.id);
  return NextResponse.json({ pointer });
}

// PUT: upsert the pointer after each turn so it can be resumed on another device.
export async function PUT(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => null);
  const parsed = chatSessionPointerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat session pointer." }, { status: 400 });
  }

  await saveChatSessionPointer(user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
