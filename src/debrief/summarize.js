// @flow strict

import type { Annotation } from './Annotation';

/**
 * Walks the annotation tree and emits the annotation's key path within the
 * object tree, and the message as a series of messages (array of strings).
 */
export default function summarize(
    ann: Annotation,
    keypath: $ReadOnlyArray<number | string> = [],
): Array<string> {
    const result: Array<string> = [];

    if (ann._type === 'array') {
        const items = ann.items;
        let index = 0;
        items.forEach((ann) => {
            summarize(ann, [...keypath, index++]).forEach((item) =>
                // Collect to results
                result.push(item),
            );
        });
    } else if (ann._type === 'object') {
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
        prefix = `Value at keypath ${keypath.map((x) => x.toString()).join('.')}: `;
    }
    return [...result, prefix + text];
}
