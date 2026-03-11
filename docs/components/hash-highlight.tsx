'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Triggers the heading highlight animation after client-side (SPA) navigations.
 * The CSS :target pseudo-class only fires on full page loads, so this component
 * manually adds a class to replay the animation when the hash changes via
 * Next.js routing.
 */
export function HashHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    el.classList.remove('heading-highlight');
    // Force reflow so re-adding the class restarts the animation
    void el.offsetWidth;
    el.classList.add('heading-highlight');

    const onEnd = () => el.classList.remove('heading-highlight');
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, [pathname]);

  return null;
}
