/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kglfdycu0s7oxsz8.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/equipment',
        destination: '/gallery',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
