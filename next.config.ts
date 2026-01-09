/** @type {import('next').NextConfig} */
// @ts-ignore
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // These two must move inside workboxOptions
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true, // This is usually used alongside skipWaiting
  },
});

const nextConfig = {
  reactStrictMode: true,
  // Ensure turbopack is empty to avoid conflicts with the PWA webpack worker
  turbopack: {}, 
};

export default withPWA(nextConfig);