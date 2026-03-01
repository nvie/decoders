import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const withMDX = createMDX();
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  images: { unoptimized: true },
  turbopack: { root: __dirname },
  reactStrictMode: true,
};

export default withMDX(config);
