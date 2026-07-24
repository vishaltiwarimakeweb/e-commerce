import { getRedisClient } from "@/lib/redis";

const WINDOW_SECONDS = 60;
const MAX_MESSAGES_PER_WINDOW = 10;

export interface ChatRateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// Guards the ShopWise chat endpoint against runaway API spend — every message
// is a paid model call, and the eve channel is intentionally open to anonymous
// traffic (see agent/channels/eve.ts). Fails open on a Redis error: a
// transient cache outage should degrade to "no rate limit," not "no chat."
export async function checkChatRateLimit(identifier: string): Promise<ChatRateLimitResult> {
  try {
    const redis = getRedisClient();
    const key = `chat-rate-limit:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
    if (count > MAX_MESSAGES_PER_WINDOW) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS };
    }
    return { allowed: true };
  } catch (error) {
    console.error("Chat rate limit check failed, allowing the message through:", error);
    return { allowed: true };
  }
}
