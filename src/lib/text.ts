// Two spaces of indentation
export const INDENT = '  ';

export function isMultiline(s: string): boolean {
  return s.includes('\n');
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

const quotePattern = /'/g;

export function quote(value: unknown): string {
  return typeof value === 'string'
    ? "'" + value.replace(quotePattern, "\\'") + "'"
    : value === undefined
      ? 'undefined'
      : JSON.stringify(value);
}
