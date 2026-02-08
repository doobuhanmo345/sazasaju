/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Disabled for API routes
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'sazasaju.com',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
