import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable Turbopack explicitly (Next.js 16 default)
  turbopack: {},

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Pin Turbopack root to this app to silence multi-lockfile warning
    turbopack: {
      root: __dirname,
    },
  },

  // Reduce noisy sourcemap issues in dev/prod
  productionBrowserSourceMaps: false,
};

export default nextConfig;
