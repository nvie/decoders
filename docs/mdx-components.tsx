import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Sig, DecoderSig } from "@/components/sig";
import { DecoderPlayground } from "@/components/decoder-playground";
import { Since } from "@/components/since";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Sig,
    DecoderSig,
    DecoderPlayground,
    Since,
    ...components,
  };
}
