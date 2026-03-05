import type { NextConfig } from "next";

import "@/lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // output: "standalone",
  // transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
