/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_SHORELINE_ASSET_VERSION: process.env.GITHUB_SHA || 'development' },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.galaxy.ai" },
      { protocol: "https", hostname: "galaxy-prod.tlcdn.com" },
    ],
  },
  devIndicators: false,
};

module.exports = nextConfig;
