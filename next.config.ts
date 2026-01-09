// @ts-ignore
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add this block to fix the Turbopack vs Webpack error
  experimental: {
    turbo: {
      // This tells Next.js to allow the PWA plugin to use Webpack
    },
  },
};

export default withPWA(nextConfig);