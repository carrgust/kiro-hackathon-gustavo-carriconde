/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  transpilePackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/pdfkit', '@react-pdf/primitives'],
}

module.exports = nextConfig
