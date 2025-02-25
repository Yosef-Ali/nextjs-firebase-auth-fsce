/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com'
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false
      };
    }
    return config;
  },
  // Explicitly enable App Router
  experimental: {
    appDir: true
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL,
    NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

