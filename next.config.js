/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/jaguar-occasions',
  assetPrefix: '/jaguar-occasions/',
  trailingSlash: true,
};

module.exports = nextConfig;
