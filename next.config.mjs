/** @type {import('next').NextConfig} */
const basePath = '/zoho'
const nextConfig = {
  basePath,
  assetPrefix: basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force correct MIME types for static assets (fixes text/plain when behind proxy)
  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*.css',
        headers: [{ key: 'Content-Type', value: 'text/css; charset=utf-8' }],
      },
      {
        source: '/_next/static/chunks/:path*.js',
        headers: [{ key: 'Content-Type', value: 'application/javascript; charset=utf-8' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
