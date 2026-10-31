import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Separate build output allows isolated testing alongside the local app. */
  distDir: process.env.EUNISTUD_ISOLATED_TEST === '1' ? '.next-test' : '.next',
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
