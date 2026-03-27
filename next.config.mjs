/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production settings
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize image loading performance
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Compress responses
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects for common paths
  async redirects() {
    return [
      // Redirect old admin paths if needed
      {
        source: '/admin/:path*',
        has: [{ type: 'header', key: 'x-api-key' }],
        destination: '/api/admin/:path*',
        permanent: false,
      },
    ]
  },

  // Static export configuration (optional - uncomment for static hosting)
  // output: 'export',
  // trailingSlash: true,
}

export default nextConfig
