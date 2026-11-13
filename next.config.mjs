/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets another device on the same Wi-Fi load the dev server (npm run dev:lan).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
};
export default nextConfig;
