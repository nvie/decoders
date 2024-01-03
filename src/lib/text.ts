// Two spaces of indentation
export const INDENT = '  ';

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
