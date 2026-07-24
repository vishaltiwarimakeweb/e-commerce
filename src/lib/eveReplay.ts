import { Client, isCurrentTurnBoundaryEvent } from "eve/client";
import type { HandleMessageStreamEvent } from "eve/client";
import type { ChatSessionPointer } from "@/lib/chatSession";

// Replays a ShopWise session's full history from another device: eve keeps
// the durable record, we just re-read it (see ChatSessionPointer). Stops at
// the first turn boundary — the durable stream otherwise stays open forever
// waiting for the next message.
export async function replayChatSession(
  pointer: ChatSessionPointer,
): Promise<readonly HandleMessageStreamEvent[]> {
  const client = new Client({ host: "" });
  const session = client.session({ ...pointer, streamIndex: 0 });

  const events: HandleMessageStreamEvent[] = [];
  for await (const event of session.stream({ startIndex: 0 })) {
    events.push(event);
    if (isCurrentTurnBoundaryEvent(event)) break;
  }
  return events;
}
