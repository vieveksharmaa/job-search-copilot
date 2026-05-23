/** @type {import('next').NextConfig} */
const config = {
  webpack: (config) => {
    // Fixes pdfjs-dist canvas dependency in server context
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    return config
  },
}

export default config
