ne/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/fundraising',
  reactStrictMode: true,
  swcMinify: true,
  // Optimize for static generation with ISR (Incremental Static Regeneration)
  // output: 'export' would be fully static, but we need ISR for revalidation
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
    // Limit concurrent workers during build to prevent DB connection exhaustion
    // workerThreads: false,
    // cpus: 1,
  },
  // Optimize for static generation
  trailingSlash: false,
  generateEtags: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.iconify.design',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crypto-fundraising.info',
        pathname: '/**',
      },
    ],
    domains: [
      'images.unsplash.com', 
      'droomdroom.com',
      'bucket.droomdroom.online',
      'fundraisingbucket.bucket.droomdroom.online',
      'droomdroom.com/api/images',
      'example.com',
      'via.placeholder.com',
      "crypto-fundraising.info"
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  publicRuntimeConfig: {
    basePath:'/fundraising',
  },
};

export default nextConfig;