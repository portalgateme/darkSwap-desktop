/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? '' : undefined,
  assetPrefix: isProd ? './' : undefined, // 👈 quan trọng cho Electron
  images: { unoptimized: true } // 👈 quan trọng cho Electron
}

module.exports = nextConfig
