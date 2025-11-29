import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? "/blogflow" : "",
  assetPrefix: isProd ? "/blogflow" : "",
};

export default nextConfig;
