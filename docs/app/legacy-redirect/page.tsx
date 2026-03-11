'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DECODER_REDIRECTS } from '@/lib/decoder-redirects';

export default function ApiHtmlRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove '#'
    if (hash) {
      const key = hash.toLowerCase();
      if (key in DECODER_REDIRECTS) {
        router.replace(`/${hash}`);
        return;
      }
      // Decoder.html uses bare method names like #refineType → /.refineType
      const dotKey = `.${key}`;
      if (dotKey in DECODER_REDIRECTS) {
        router.replace(`/.${hash}`);
        return;
      }
    }
    router.replace('/docs');
  }, [router]);

  return null;
}
