import { z } from "zod";

export const chatSessionPointerSchema = z.object({
  sessionId: z.string().min(1),
  continuationToken: z.string().min(1),
});
export type ChatSessionPointerInput = z.infer<typeof chatSessionPointerSchema>;
