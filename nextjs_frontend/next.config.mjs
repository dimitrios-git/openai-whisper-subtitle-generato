/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/subtitles/:path*',
        destination: 'http://localhost:5000/subtitles/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
