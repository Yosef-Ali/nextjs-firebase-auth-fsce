/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: [
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com'
    ],
  },
}

module.exports = nextConfig
