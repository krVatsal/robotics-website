/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    TAVUS_API_KEY: process.env.TAVUS_API_KEY,
    TAVUS_VOICE_ID: process.env.TAVUS_VOICE_ID,
  },
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;