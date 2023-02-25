/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["images.unsplash.com", "cdn.pixabay.com", "images.pexel.com"],
  },
};

module.exports = nextConfig;
