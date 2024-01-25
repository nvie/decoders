import { INDENT, indent, isMultiline, quote } from '~/lib/text';
import { isDate } from '~/lib/utils';

import type {
  Annotation,
  ArrayAnnotation,
  ObjectAnnotation,
  OpaqueAnnotation,
} from './annotate';

export type Formatter = (err: Annotation) => string | Error;

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
    for (const [key, value] of fields) {
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
        : `Value at key ${quote(keypath[0])}: `;
  } else {
    prefix = `Value at keypath ${quote(keypath.map(String).join('.'))}: `;
  }
  return [...result, `${prefix}${text}`];
}

function serializeString(s: string, width: number = 80): string {
  // Full string
  // Abbreviated to $maxlen i.e. "Vincent Driess..." [truncated]
  let ser = JSON.stringify(s);
  if (ser.length <= width) {
    return ser;
  }

  // Cut off a bit
  const truncated = `${s.substring(0, width - 15)}...`;
  ser = `${JSON.stringify(truncated)} [truncated]`;
  return ser;
}

function serializeArray(annotation: ArrayAnnotation, prefix: string): string {
  const { items } = annotation;
  if (items.length === 0) {
    return '[]';
  }

  const result: string[] = [];
  for (const item of items) {
    const [ser, ann] = serializeAnnotation(item, `${prefix}${INDENT}`);
    result.push(`${prefix}${INDENT}${ser}${','}`);
    if (ann !== undefined) {
      result.push(indent(ann, `${prefix}${INDENT}`));
    }
  }
  return ['[', ...result, `${prefix}]`].join('\n');
}

function serializeObject(annotation: ObjectAnnotation, prefix: string): string {
  const { fields } = annotation;

  if (fields.size === 0) {
    return '{}';
  }

  const result: string[] = [];
  for (const [key, valueAnnotation] of fields) {
    const kser = serializeValue(key);

    const valPrefix = `${prefix}${INDENT}${' '.repeat(kser.length + 2)}`;
    const [vser, vann] = serializeAnnotation(valueAnnotation, `${prefix}${INDENT}`);

    result.push(`${prefix}${INDENT}${kser}: ${vser},`);
    if (vann !== undefined) {
      result.push(indent(vann, valPrefix));
    }
  }
  return ['{', ...result, `${prefix}}`].join('\n');
}

export function serializeValue(value: unknown): string {
  if (typeof value === 'string') {
    return serializeString(value);
  } else if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol'
  ) {
    return value.toString();
  } else if (value === null) {
    return 'null';
  } else if (value === undefined) {
    return 'undefined';
  } else {
    if (isDate(value)) {
      return `new Date(${quote(value.toISOString())})`;
    } else if (value instanceof Date) {
      // NOTE: Using `instanceof Date` is unreliable way of checking dates.
      // If this case occurs (and it didn't pass the prior isDate())
      // check, then this must be the case where it's an invalid date.
      return '(Invalid Date)';
    } else {
      return '(unserializable)';
    }
  }
}

export function serializeAnnotation(
  ann: Annotation,
  prefix: string = '',
): [string, string | undefined] {
  // The serialized data (the input object echoed back)
  let serialized: string;

  if (ann.type === 'array') {
    serialized = serializeArray(ann, prefix);
  } else if (ann.type === 'object') {
    serialized = serializeObject(ann, prefix);
  } else if (ann.type === 'scalar') {
    serialized = serializeValue(ann.value);
  } else {
    ((_: OpaqueAnnotation) => {})(ann); // Serves as an exhaustiveness check
    serialized = ann.value;
  }

  const text = ann.text;
  if (text !== undefined) {
    const sep = '^'.repeat(isMultiline(serialized) ? 1 : serialized.length);
    return [serialized, [sep, text].join(isMultiline(text) ? '\n' : ' ')];
  } else {
    return [serialized, undefined];
  }
}

export function formatInline(ann: Annotation): string {
  const [serialized, annotation] = serializeAnnotation(ann);
  if (annotation !== undefined) {
    return `${serialized}\n${annotation}`;
  } else {
    return serialized;
  }
}

export function formatShort(ann: Annotation): string {
  return summarize(ann, []).join('\n');
}
