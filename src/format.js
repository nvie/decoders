// @flow strict

import { summarize as _summarize, asDate, INDENT, indent, isMultiline } from './_utils';
import type { Annotation, ArrayAnnotation, ObjectAnnotation } from './annotate';

export type Formatter = (err: Annotation) => string | Error;

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

    const result = [];
    items.forEach((item) => {
        const [ser, ann] = serializeAnnotation(item, `${prefix}${INDENT}`);
        result.push(`${prefix}${INDENT}${ser}${','}`);
        if (ann !== undefined) {
            result.push(indent(ann, `${prefix}${INDENT}`));
        }
    });
    return ['[', ...result, `${prefix}]`].join('\n');
}

function serializeObject(annotation: ObjectAnnotation, prefix: string): string {
    const { fields } = annotation;

    const fieldNames = Object.keys(fields);
    if (fieldNames.length === 0) {
        return '{}';
    }

    const result = [];
    fieldNames.forEach((key) => {
        const valueAnnotation = fields[key];
        const kser = serializeValue(key);

        const valPrefix = `${prefix}${INDENT}${' '.repeat(kser.length + 2)}`;
        const [vser, vann] = serializeAnnotation(valueAnnotation, `${prefix}${INDENT}`);

        result.push(`${prefix}${INDENT}${kser}: ${vser},`);
        if (vann !== undefined) {
            result.push(indent(vann, valPrefix));
        }
    });
    return ['{', ...result, `${prefix}}`].join('\n');
}

export function serializeValue(value: mixed): string {
    // istanbul ignore else
    if (typeof value === 'string') {
        return serializeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    } else if (value === null) {
        return 'null';
    } else if (value === undefined) {
        return 'undefined';
    } else {
        const valueAsDate = asDate(value);
        if (valueAsDate !== null) {
            return `new Date(${JSON.stringify(valueAsDate.toISOString())})`;
        } else if (value instanceof Date) {
            // NOTE: Using `instanceof Date` is unreliable way of checking dates.
            // If this case occurs (and it didn't pass the prior asDate())
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
): [string, string | void] {
    // The serialized data (the input object echoed back)
    let serialized;
    if (ann.type === 'array') {
        serialized = serializeArray(ann, prefix);
    } else if (ann.type === 'object') {
        serialized = serializeObject(ann, prefix);
    } else if (ann.type === 'function') {
        serialized = '<function>';
    } else if (ann.type === 'circular-ref') {
        serialized = '<circular ref>';
    } else if (ann.type === 'unknown') {
        serialized = '???';
    } else {
        serialized = serializeValue(ann.value);
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
    return _summarize(ann, []).join('\n');
}
