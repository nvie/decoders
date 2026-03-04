import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { visit, SKIP } from "unist-util-visit";
import type { Root, Paragraph } from "mdast";
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
 * Extract alias names from the aliases JSX attribute.
 * Aliases are passed as an array of objects with a `name` property,
 * e.g. aliases={[{ name: "iso8601", info: ... }]}
 */
function extractAliasNames(node: MdxJsxFlowElement): string[] {
  const aliasAttr = node.attributes.find(
    (a) => a.type === "mdxJsxAttribute" && a.name === "aliases",
  );
  if (!aliasAttr) return [];

  const names: string[] = [];
  const expr =
    aliasAttr.value &&
    typeof aliasAttr.value === "object" &&
    "data" in aliasAttr.value &&
    aliasAttr.value.data?.estree;
  if (!expr) return names;

  function walk(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    const rec = obj as Record<string, unknown>;
    if (
      rec.type === "Property" &&
      rec.key &&
      typeof rec.key === "object" &&
      (rec.key as Record<string, unknown>).type === "Identifier" &&
      (rec.key as Record<string, unknown>).name === "name" &&
      rec.value &&
      typeof rec.value === "object" &&
      (rec.value as Record<string, unknown>).type === "Literal" &&
      typeof (rec.value as Record<string, unknown>).value === "string"
    ) {
      names.push((rec.value as Record<string, unknown>).value as string);
    }
    for (const val of Object.values(rec)) {
      if (Array.isArray(val)) {
        val.forEach(walk);
      } else if (val && typeof val === "object") {
        walk(val);
      }
    }
  }
  walk(expr);
  return names;
}

/**
 * Remark plugin that makes DecoderSig components searchable.
 * The primary name and each alias name become separate search entries.
 */
function remarkDecoderSigSearch() {
  return (tree: Root) => {
    visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElement, index, parent) => {
      if (node.name !== "DecoderSig") return;
      if (index === undefined || !parent) return;

      const nameAttr = node.attributes.find(
        (a) => a.type === "mdxJsxAttribute" && a.name === "name",
      );
      if (!nameAttr || typeof nameAttr.value !== "string") return;

      // Primary name
      node.data = { ...node.data, _string: `${nameAttr.value} decoder` };

      // Insert a hidden paragraph node for each alias so they become
      // separate search entries pointing to the same section
      const aliasNames = extractAliasNames(node);
      const aliasNodes: Paragraph[] = aliasNames.map((alias) => ({
        type: "paragraph",
        children: [],
        data: { _string: `${alias} decoder (alias)` },
      }));

      if (aliasNodes.length > 0) {
        parent.children.splice(index + 1, 0, ...aliasNodes);
        return [SKIP, index + 1 + aliasNodes.length] as const;
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
