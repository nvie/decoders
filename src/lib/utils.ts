// Two spaces of indentation
export const INDENT = '  ';

/**
 * Subtract two sets. Why isn't this a standard method on Sets?
 */
export function subtract<T>(xs: Set<T>, ys: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const x of xs) {
    if (!ys.has(x)) {
      result.add(x);
    }
  }
  return result;
}

/**
 * Is value is a valid Date instance, then return that. If not, then return
 * null.
 */
export function asDate(value: unknown): Date | null {
  //
  // `x instanceof Date` checks are unreliable across stack frames (that
  // information might get lost by the JS runtime), so we'll have to reside
  // to more runtime inspection checks.
  //
  // Taken from https://stackoverflow.com/a/44198641
  //
  return !!value &&
    Object.prototype.toString.call(value) === '[object Date]' &&
    !isNaN(value as number)
    ? (value as Date)
    : null;
}

export function isPojo(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    // This still seems to be the only reliable way to determine whether
    // something is a pojo... ¯\_(ツ)_/¯
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function isMultiline(s: string): boolean {
  return s.indexOf('\n') >= 0;
}

export function indent(s: string, prefix: string = INDENT): string {
  if (isMultiline(s)) {
    return s
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');
  } else {
    return `${prefix}${s}`;
  }
}
