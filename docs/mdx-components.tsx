import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Sig, DecoderSig } from "@/components/sig";
import { DecoderPlayground } from "@/components/decoder-playground";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Sig,
    DecoderSig,
    DecoderPlayground,
    ...components,
  };
}
