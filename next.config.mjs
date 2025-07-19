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
  },
   server: {
    port: 5175,  // Your chosen port
    host: '0.0.0.0',  // Allow external connections
  },
}

export default nextConfig
