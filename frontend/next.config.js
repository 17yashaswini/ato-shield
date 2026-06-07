/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/ml/:path*',
        destination: 'https://ato-shield-production.up.railway.app/:path*',
      },
    ]
  },
}

module.exports = nextConfig
