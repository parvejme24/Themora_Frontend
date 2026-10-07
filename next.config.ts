import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "images.unsplash.com",
      "source.unsplash.com",
      "localhost",
      "images.pexels.com",
      "example.com",
      "encrypted-tbn0.gstatic.com",
      "play-lh.googleusercontent.com",
      "media.licdn.com",
      "i.ibb.co.com",
      "res.cloudinary.com",
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Proxy API requests in development to bypass CORS
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
    
    // Only proxy in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
