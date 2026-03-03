import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

/**
 * Remark plugin that makes DecoderSig components searchable by
 * setting their stringified form to just the function name.
 */
function remarkDecoderSigSearch() {
  return (tree: Root) => {
    visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement) => {
      if (node.name !== "DecoderSig") return;
      const nameAttr = node.attributes.find(
        (a) => a.type === "mdxJsxAttribute" && a.name === "name",
      );
      if (nameAttr && typeof nameAttr.value === "string") {
        node.data = { ...node.data, _string: `${nameAttr.value} decoder` };
      }
    });
  };
}

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkDecoderSigSearch],
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
