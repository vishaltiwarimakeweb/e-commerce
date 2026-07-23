import type { NextConfig } from "next";

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

export default nextConfig;
