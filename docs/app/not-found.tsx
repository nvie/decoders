'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { formatInline, never, object } from '@/decoders-latest-snapshot';

const page = object({
  path: never('Must be existing page'),
});

export default function NotFound() {
  const input = { path: usePathname() ?? '/unknown' };
  const result = page.decode(input);
  const error = result.ok ? 'Should never happen' : formatInline(result.error);
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-3 text-2xl font-bold text-fd-foreground">404</div>
        <pre
          className="overflow-x-auto rounded-lg border border-fd-border bg-fd-card px-4 py-3 font-mono text-sm"
          style={{ color: 'light-dark(#c4210a, #e5534b)' }}
        >
          {error}
        </pre>

        <div className="mt-3">
          <Link
            href="/docs"
            className="text-sm font-medium text-[color:var(--color-fd-primary)] hover:underline"
          >
            Back to docs
          </Link>
        </div>
      </div>
    </div>
  );
}
