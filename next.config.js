/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true, // We'll handle type checking in a separate step
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
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
      // Don't attempt to load these modules on the client side
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
}

// Add environment variables
const { NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID, NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
module.exports = {
  ...nextConfig,
  env: {
    NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL,
    NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY,
  }
}

