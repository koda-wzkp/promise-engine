/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Capacitor builds, set output: "export" via NEXT_OUTPUT=export
  // For web deployment (Vercel), leave as default (server rendering)
  ...(process.env.NEXT_OUTPUT === "export" ? { output: "export" } : {}),
};

module.exports = nextConfig;
