import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    
    return [
      {
        source: "/api/:path*",
        destination: isProd
          ? "https://tesserio.up.railway.app/api/:path*" // Live Production (Railway)
          : "http://localhost:5000/api/:path*",        // Local Dev (Your machine)
      },
    ];
  },
};

export default nextConfig;