import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Prevent static prerender failures on pages using client-only hooks
  // (all page rendering uses App Router via src/app/; src/pages/ is for components only)
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
