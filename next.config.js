/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.ctfassets.net'],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://community-der-informatischen-ags.vercel.app/:path*",
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
