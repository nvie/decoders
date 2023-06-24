// @flow strict

import type { Annotation } from './annotate';
import type { Scalar } from './Decoder';

// $FlowFixMe[unclear-type] - deliberate use of `any`
export type _Any = any;

// Two spaces of indentation
export const INDENT = '  ';

/**
 * Subtract two sets. Why isn't this a standard method on Sets?
 */
export function subtract<T: Scalar>(xs: Set<T>, ys: Set<T>): Set<T> {
    const result = new Set();
    xs.forEach((x) => {
        if (!ys.has(x)) {
            result.add(x);
        }
    });
    return result;
}

/**
 * Is value is a valid Date instance, then return that. If not, then return
 * null.
 */
export function asDate(value: mixed): Date | null {
    //
    // `x instanceof Date` checks are unreliable across stack frames (that
    // information might get lost by the JS runtime), so we'll have to reside
    // to more runtime inspection checks.
    //
    // Taken from https://stackoverflow.com/a/44198641
    //
    return !!value &&
        // $FlowFixMe[method-unbinding]
        Object.prototype.toString.call(value) === '[object Date]' &&
        !isNaN(value)
        ? ((value: _Any): Date)
        : null;
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
    keypath: $ReadOnlyArray<number | string> = [],
): Array<string> {
    const result: Array<string> = [];

    if (ann.type === 'array') {
        const items = ann.items;
        let index = 0;
        items.forEach((ann) => {
            summarize(ann, [...keypath, index++]).forEach((item) =>
                // Collect to results
                result.push(item),
            );
        });
    } else if (ann.type === 'object') {
        const fields = ann.fields;
        Object.keys(fields).forEach((key) => {
            const value = fields[key];
            summarize(value, [...keypath, key]).forEach((item) =>
                // Collect to results
                result.push(item),
            );
        });
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
