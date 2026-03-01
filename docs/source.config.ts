import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    remarkHeadingOptions: {
      slug: (_root, _heading, text) =>
        text
          .toLowerCase()
          .replace(/[()]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9.\-]/g, "")
          .replace(/-{2,}/g, "-")
          .replace(/^-|-$/g, ""),
    },
  },
});
