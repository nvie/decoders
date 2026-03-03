import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const withMDX = createMDX();
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));

/** @type {import('next').NextConfig} */
const config = {
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
    resolveAlias: {
      decoders: "./decoders-latest-snapshot/index.js",
    },
  },
  env: {
    WIP_DECODERS_VERSION: pkg.version,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/docs.mdx",
        destination: "/llms.mdx/docs",
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(config);
