/**
 * Subtract two sets. This is a polyfill until we have it natively
 * available, see https://tc39.es/proposal-set-methods/#sec-set.prototype.difference
 */
export function difference<T>(xs: Set<T>, ys: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const x of xs) {
    if (!ys.has(x)) {
      result.add(x);
    }
  }
  return result;
}
