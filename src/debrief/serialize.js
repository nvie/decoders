// @flow strict

import { asDate, indent, INDENT, isMultiline } from './utils';
import type { Annotation, AnnPair } from './ast';

function serializeString(s: string, width: number = 80) {
    // Full string
    // Abbreviated to $maxlen i.e. "Vincent Driess..." [truncated]
    let ser = JSON.stringify(s);
    if (ser.length <= width) {
        return ser;
    }

    // Cut off a bit
    const truncated = s.substring(0, width - 15) + '...';
    ser = JSON.stringify(truncated) + ' [truncated]';
    return ser;
}

function serializeArray(value: Array<Annotation>, prefix: string) {
    if (value.length === 0) {
        return '[]';
    }

    const result = [];
    value.forEach((item) => {
        const [ser, ann] = serializeAnnotation(item, prefix + INDENT);
        result.push(prefix + INDENT + ser + ',');
        if (ann !== undefined) {
            result.push(indent(ann, prefix + INDENT));
        }
    });
    return ['[', ...result, prefix + ']'].join('\n');
}

function serializeObject(pairs: Array<AnnPair>, prefix: string) {
    if (pairs.length === 0) {
        return '{}';
    }

    const result = [];
    pairs.forEach((pair) => {
        const key: string = pair.key;
        const value: Annotation = pair.value;
        const kser = serializeValue(key);

        const valPrefix = prefix + INDENT + ' '.repeat(kser.length + 2);
        const [vser, vann] = serializeAnnotation(value, prefix + INDENT);

        result.push(prefix + INDENT + kser + ': ' + vser + ',');
        if (vann !== undefined) {
            result.push(indent(vann, valPrefix));
        }
    });
    return ['{', ...result, prefix + '}'].join('\n');
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
): [string, string | void] {
    let serialized;
    if (ann.type === 'ArrayAnnotation') {
        serialized = serializeArray(ann.items, prefix);
    } else if (ann.type === 'ObjectAnnotation') {
        serialized = serializeObject(ann.pairs, prefix);
    } else if (ann.type === 'FunctionAnnotation') {
        serialized = 'function() {}';
    } else if (ann.type === 'CircularRefAnnotation') {
        serialized = '<circular ref>';
    } else {
        serialized = serializeValue(ann.value);
    }

    const annotation = ann.annotation;
    if (annotation !== undefined) {
        const sep = '^'.repeat(isMultiline(serialized) ? 1 : serialized.length);
        return [serialized, [sep, annotation].join(isMultiline(annotation) ? '\n' : ' ')];
    } else {
        return [serialized, undefined];
    }
}

export default function serialize(ann: Annotation): string {
    const [serialized, annotation] = serializeAnnotation(ann);
    if (annotation !== undefined) {
        return `${serialized}\n${annotation}`;
    } else {
        return `${serialized}`;
    }
}
