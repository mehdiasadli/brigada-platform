import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@brigada/ui", "@brigada/auth", "@brigada/env"],
  async rewrites() {
    const authApi =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${authApi}/api/auth/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${authApi}/api/admin/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
