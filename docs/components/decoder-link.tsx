import { DECODER_REDIRECTS } from '@/lib/decoder-redirects';
import Link from 'fumadocs-core/link';
import type { ComponentProps, ReactNode } from 'react';
import { isValidElement } from 'react';

/**
 * Whether the link's entire content is a single inline code span, e.g.
 * [`object()`][]. CSS can't detect this (`:only-child` ignores text nodes),
 * so we mark these links with a class instead.
 */
function isCodeOnly(children: ReactNode): boolean {
  return isValidElement(children) && children.type === 'code';
}

/**
 * Like the default fumadocs Link, but forces a full page navigation for
 * decoder redirect URLs (e.g. /email, /.chain). This is necessary because
 * Next.js client-side navigation doesn't hit route handlers, so the 302
 * redirect with hash fragment never fires.
 *
 * Instead, we resolve the redirect at render time and emit a plain <a> tag
 * so the browser does a normal navigation.
 */
export function GotoDecoderLink({ href, className, ...props }: ComponentProps<'a'>) {
  if (isCodeOnly(props.children)) {
    className = className ? `${className} code-link` : 'code-link';
  }
  if (href) {
    const key = href.replace(/^\//, '').toLowerCase();
    const resolved = DECODER_REDIRECTS[key];
    if (resolved) {
      return <a href={resolved} className={className} {...props} />;
    }
  }
  return <Link href={href} className={className} {...props} />;
}
