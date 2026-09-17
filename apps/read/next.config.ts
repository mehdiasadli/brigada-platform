import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@brigada/ui", "@brigada/auth", "@brigada/env"],
  async rewrites() {
    const api =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:4000";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${api}/api/auth/:path*`,
      },
      {
        source: "/api/read/:path*",
        destination: `${api}/api/read/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
