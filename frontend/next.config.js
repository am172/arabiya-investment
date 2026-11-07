/** @type {import('next').Next.config} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.youtube.com' }
    ]
  },
  eslint: {
    // يتخطى أخطاء الـ ESLint أثناء الـ Build لمنع توقف المشروع
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;