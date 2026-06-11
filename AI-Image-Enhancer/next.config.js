/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/ai-image-enhancer",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
