import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // The ShopWise widget is available to signed-in users and guests alike,
    // so the eve channel itself stays anonymous — per-message rate limiting
    // is the abuse guard, not route auth (see Phase 5 in eve-docs/PROGRESS.md).
    none(),
  ],
});
