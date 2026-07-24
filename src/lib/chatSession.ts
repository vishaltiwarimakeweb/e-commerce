import { connectToDatabase } from "@/lib/db";
import { ChatSession } from "@/models/ChatSession";
import type { ChatSessionPointerInput } from "@/lib/validation/chatSession";

export type ChatSessionPointer = ChatSessionPointerInput;

// Cross-device resume for signed-in users: just the eve session cursor, never
// the message content itself (that stays in eve's own durable session store).
export async function getChatSessionPointer(userId: string): Promise<ChatSessionPointer | null> {
  await connectToDatabase();
  const doc = await ChatSession.findOne({ user: userId }).select("sessionId continuationToken").lean();
  if (!doc) return null;
  return { sessionId: doc.sessionId, continuationToken: doc.continuationToken };
}

export async function saveChatSessionPointer(userId: string, pointer: ChatSessionPointer): Promise<void> {
  await connectToDatabase();
  await ChatSession.findOneAndUpdate({ user: userId }, { $set: pointer }, { upsert: true });
}
