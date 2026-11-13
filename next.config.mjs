const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;