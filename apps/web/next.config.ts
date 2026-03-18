import type { NextConfig } from "next";

import "@/lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // output: "standalone",
  // transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [new URL("https://ahia-bucket.gozman.xyz/**")],
  },
};

export default nextConfig;
