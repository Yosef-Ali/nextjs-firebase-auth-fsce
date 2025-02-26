import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const tempNextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'plus.unsplash.com',
    ],
  },
  webpack(config) {
    // Support for SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Support for importing PDF files
    config.module.rules.push({
      test: /\.(pdf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      ],
    });

    return config;
  },
};

export default tempNextConfig;
