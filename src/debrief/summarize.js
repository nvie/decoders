// @flow strict

import type { Annotation } from './ast';

type Keypath = Array<number | string>;

/**
 * Walks the annotation tree and emits the annotation's key path within the
 * object tree, and the message as a series of messages (array of strings).
 */
export default function summarize(ann: Annotation, keypath: Keypath = []): Array<string> {
    const result: Array<string> = [];

    if (ann.type === 'ArrayAnnotation') {
        const items = ann.items;
        let index = 0;
        items.forEach((ann) => {
            summarize(ann, [...keypath, index++]).forEach((item) => result.push(item));
        });
    } else if (ann.type === 'ObjectAnnotation') {
        const pairs = ann.pairs;
        pairs.forEach((pair) => {
            summarize(pair.value, [...keypath, pair.key]).forEach((item) =>
                result.push(item),
            );
        });
    }

    const annotation = ann.annotation;
    if (!annotation) {
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
    return [...result, prefix + annotation];
}
