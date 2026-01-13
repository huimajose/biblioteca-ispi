import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io", // ImageKit
        port: "",
      },
      {
        protocol: "https",
        hostname: "books.google.com", // Google Books
        port: "",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org", // Open Library
        port: "",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    viewTransition: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
