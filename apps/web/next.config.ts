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
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [new URL("https://ahia-bucket.goziem.xyz/**")],
  },
};

export default nextConfig;
