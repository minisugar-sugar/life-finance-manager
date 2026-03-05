/** @type {import('next').NextConfig} */
const isGh = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGh ? "/life-finance-manager" : "",
  assetPrefix: isGh ? "/life-finance-manager/" : "",
  experimental: { typedRoutes: true }
};

module.exports = nextConfig;
