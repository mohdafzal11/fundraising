/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/fundraising',
  publicRuntimeConfig: {
    basePath: '/fundraising',
  },
  images: {
    domains: [
      'images.unsplash.com',
      'droomdroom.com',
      'bucket.droomdroom.online',
      'fundraisingbucket.bucket.droomdroom.online',
      'res.cloudinary.com',
      'api.iconify.design',
      'upload.wikimedia.org',
      'crypto-fundraising.info',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bucket.droomdroom.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fundraisingbucket.bucket.droomdroom.online',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crypto-fundraising.info',
        pathname: '/**',
      },
    ],
  },
  // Disable static optimization during build
  output: 'standalone',
  experimental: {
    // Disable static optimization
    outputFileTracingExcludes: {
      '*': [
        'node_modules/**/*',
        'public/**/*',
      ],
    },
  },
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip linting during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation for dynamic routes
  generateBuildId: async () => 'build',
}

module.exports = nextConfig