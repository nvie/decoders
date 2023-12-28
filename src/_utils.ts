import type { Annotation } from './annotate';
import type { Scalar } from './Decoder';

// Two spaces of indentation
export const INDENT = '  ';

export function lazyval<V>(value: (() => V) | V): V {
  return typeof value === 'function' ? (value as () => V)() : value;
}

/**
 * Subtract two sets. Why isn't this a standard method on Sets?
 */
export function subtract<C extends Scalar>(xs: Set<C>, ys: Set<C>): Set<C> {
  const result = new Set<C>();
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

/**
 * Walks the annotation tree and emits the annotation's key path within the
 * object tree, and the message as a series of messages (array of strings).
 */
export function summarize(
  ann: Annotation,
  keypath: readonly (number | string)[] = [],
): string[] {
  const result: string[] = [];

  if (ann.type === 'array') {
    const items = ann.items;
    let index = 0;
    for (const ann of items) {
      for (const item of summarize(ann, [...keypath, index++])) {
        // Collect to results
        result.push(item);
      }
    }
  } else if (ann.type === 'object') {
    const fields = ann.fields;
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      for (const item of summarize(value, [...keypath, key])) {
        // Collect to results
        result.push(item);
      }
    }
  }

  const text = ann.text;
  if (!text) {
    return result;
  }

  let prefix: string;
  if (keypath.length === 0) {
    prefix = '';
  } else if (keypath.length === 1) {
    prefix =
      typeof keypath[0] === 'number'
        ? `Value at index ${keypath[0]}: `
        : `Value at key ${JSON.stringify(keypath[0])}: `;
  } else {
    prefix = `Value at keypath ${keypath.map(String).join('.')}: `;
  }
  return [...result, `${prefix}${text}`];
}
