import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // maplibre-gl ships its source / worker as ESM that benefits from being
  // transpiled through Next's pipeline rather than imported raw, which avoids
  // the worker-stripping bug seen with Turbopack + maplibre-gl 5.
  transpilePackages: ["maplibre-gl"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
