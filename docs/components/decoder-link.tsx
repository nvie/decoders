import { DECODER_REDIRECTS } from "@/lib/decoder-redirects";
import Link from "fumadocs-core/link";
import type { ComponentProps } from "react";

/**
 * Like the default fumadocs Link, but forces a full page navigation for
 * decoder redirect URLs (e.g. /email, /.chain). This is necessary because
 * Next.js client-side navigation doesn't hit route handlers, so the 302
 * redirect with hash fragment never fires.
 *
 * Instead, we resolve the redirect at render time and emit a plain <a> tag
 * so the browser does a normal navigation.
 */
export function GotoDecoderLink({ href, ...props }: ComponentProps<"a">) {
  if (href) {
    const key = href.replace(/^\//, "").toLowerCase();
    const resolved = DECODER_REDIRECTS[key];
    if (resolved) {
      return <a href={resolved} {...props} />;
    }
  }
  return <Link href={href} {...props} />;
}
