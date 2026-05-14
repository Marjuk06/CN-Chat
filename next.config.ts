import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false,
  },
  // Move this to the top level, NOT inside experimental
  allowedDevOrigins: ["192.168.0.69:3000"],
};

export default nextConfig;