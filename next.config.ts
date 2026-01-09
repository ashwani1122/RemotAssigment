/** @type {import('next').NextConfig} */
// @ts-ignore
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  // MOVE THIS OUT OF EXPERIMENTAL
  // This satisfies the "no turbopack config" error
  turbopack: {}, 
};

export default withPWA(nextConfig);