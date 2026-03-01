import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const withMDX = createMDX();
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  turbopack: { root: __dirname },
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
