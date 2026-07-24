import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Dummy seed-data product photos (Phase 1).
      { protocol: "https", hostname: "picsum.photos" },
      // Review images uploaded via Cloudinary (Phase 2).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

// Mounts the ShopWise eve agent (agent/) under /eve/v1/* on this same Next.js origin.
export default withEve(nextConfig);
