import { eveChannel, defaultEveAuth } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";
import { checkChatRateLimit } from "@/lib/chatRateLimit";

export default eveChannel({
  auth: [
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // The ShopWise widget is available to signed-in users and guests alike,
    // so the eve channel itself stays anonymous — per-message rate limiting
    // (below) is the abuse guard, not route auth.
    none(),
  ],
  // Runs before every message (session create + follow-ups) reaches the
  // model, so a throttled caller never costs an API call.
  async onMessage(ctx) {
    const identifier = ctx.eve.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, retryAfterSeconds } = await checkChatRateLimit(identifier);
    if (!allowed) {
      throw new Error(
        `You're sending messages too quickly. Please wait ${retryAfterSeconds ?? 60}s and try again.`,
      );
    }
    return { auth: defaultEveAuth(ctx) };
  },
});
