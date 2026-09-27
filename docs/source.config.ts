import {
  rehypeCodeDefaultOptions,
  remarkStructureDefaultOptions,
} from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import type { TableRow } from "mdast";

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
    remarkStructureOptions: {
      // Index whole table rows instead of individual cells, so each row becomes
      // one readable search hit
      types: [
        ...remarkStructureDefaultOptions.types.filter((t) => t !== "tableCell"),
        "tableRow",
      ],
      stringify: {
        handlers: {
          // Render reference-style links (e.g. [`number`][]) as their text only
          linkReference: (node, _, state, info) => state.containerPhrasing(node, info),
          tableRow: (node: TableRow, _, state, info) =>
            node.children.map((cell) => state.containerPhrasing(cell, info)).join(" · "),
        },
      },
    },
    rehypeCodeOptions: { ...rehypeCodeDefaultOptions, icon: false },
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
