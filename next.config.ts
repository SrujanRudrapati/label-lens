import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Fixtures are read from disk at runtime, so make sure they ship with the API functions.
  outputFileTracingIncludes: { "/api/*": ["./fixtures/**/*.json"] },
};

export default nextConfig;
