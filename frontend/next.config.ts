import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.10'],
  images: {
    qualities: [70, 70, 70, 75, 85]
  },
};

export default nextConfig;
