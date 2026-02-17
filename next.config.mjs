/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabling experimental features for production stability
  experimental: {
    // turbo: false, // Ensure we use the stable webpack build on Vercel
  }
};

export default nextConfig;
