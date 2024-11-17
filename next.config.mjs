/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/posts',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
