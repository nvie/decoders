import type { ReactNode } from 'react';

/**
 * Inline info icon with a hover popover.
 *
 * Usage:
 *   <Info>This will be removed in the next major release.</Info>
 */
export function Info({ children }: { children: ReactNode }) {
  return (
    <span className="deprecated-info">
      <svg className="deprecated-info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" className="info-icon-circle" />
        <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="serif" fontStyle="italic">i</text>
      </svg>
      <span className="deprecated-info-popover">{children}</span>
    </span>
  );
}
