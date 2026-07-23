import { NextResponse } from "next/server";
import { sendSupportEmail } from "@/lib/brevo";
import { contactSchema } from "@/lib/validation/support";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await sendSupportEmail(parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't send your message.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
