import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Sig, DecoderSig } from "@/components/sig";
import { DecoderPlayground } from "@/components/decoder-playground-server";
import { Since } from "@/components/since";
import { Info } from "@/components/info";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Sig,
    DecoderSig,
    DecoderPlayground,
    Steps,
    Step,
    Cards,
    Card,
    Since,
    Info,
    ...components,
  };
}
