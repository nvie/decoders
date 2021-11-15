// @flow strict

import { asAnnotation } from './types';
import type { Annotation, CircularRefAnnotation, ObjectAnnotation } from './types';

type RefSet = WeakSet<{ ... } | $ReadOnlyArray<mixed>>;

function _annotateFields(
    object: { +[string]: mixed, ... },
    fields: $ReadOnlyArray<[/* key */ string, string | Annotation]>,
    seen: RefSet,
): ObjectAnnotation | CircularRefAnnotation {
    if (seen.has(object)) {
        return { type: 'CircularRefAnnotation', text: undefined };
    }
    seen.add(object);

    // Convert the object to a list of pairs
    let pairs = Object.entries(object);

    // If we want to annotate keys that are missing in the object, add an
    // explicit "undefined" value for those now, so we have a place in the
    // object to annotate
    const existingKeys = new Set(Object.keys(object));
    fields.forEach(([fieldName]) => {
        if (!existingKeys.has(fieldName)) {
            pairs.push([fieldName, undefined]);
        }
    });

    fields.forEach(([fieldName, ann]) => {
        pairs = pairs.map(([key, value]) =>
            fieldName === key
                ? [key, typeof ann === 'string' ? _annotate(value, ann, seen) : ann]
                : [key, value],
        );
    });

    return _annotatePairs(pairs, undefined, seen);
}

export function annotateFields(
    object: { +[string]: mixed, ... },
    fields: $ReadOnlyArray<[/* key */ string, string | Annotation]>,
): ObjectAnnotation | CircularRefAnnotation {
    return _annotateFields(object, fields, new WeakSet());
}

function _annotatePairs(
    value: Array<[string, mixed]>,
    text?: string,
    seen: RefSet,
): ObjectAnnotation {
    const pairs = value.map(([key, v]) => {
        return { key, value: _annotate(v, undefined, seen) };
    });
    return { type: 'ObjectAnnotation', pairs, text };
}

function _annotate(value: mixed, text?: string, seen: RefSet): Annotation {
    if (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value.getMonth === 'function'
    ) {
        return { type: 'ScalarAnnotation', value, text };
    }

    const ann = asAnnotation(value);
    // istanbul ignore else
    if (ann) {
        if (text === undefined) {
            return ann;
        } else if (ann.type === 'ObjectAnnotation') {
            return { type: 'ObjectAnnotation', pairs: ann.pairs, text };
        } else if (ann.type === 'ArrayAnnotation') {
            return { type: 'ArrayAnnotation', items: ann.items, text };
        } else if (ann.type === 'FunctionAnnotation') {
            return { type: 'FunctionAnnotation', text };
        } else if (ann.type === 'CircularRefAnnotation') {
            return { type: 'CircularRefAnnotation', text };
        } else {
            return { type: 'ScalarAnnotation', value: ann.value, text };
        }
    } else if (Array.isArray(value)) {
        if (seen.has(value)) {
            return { type: 'CircularRefAnnotation', text };
        } else {
            seen.add(value);
        }
        const items = value.map((v) => _annotate(v, undefined, seen));
        return { type: 'ArrayAnnotation', items, text };
    } else if (typeof value === 'object') {
        if (seen.has(value)) {
            return { type: 'CircularRefAnnotation', text };
        } else {
            seen.add(value);
        }
        return _annotatePairs(Object.entries(value), text, seen);
    } else if (typeof value === 'function') {
        return { type: 'FunctionAnnotation', text };
    } else {
        throw new Error('Unknown annotation');
    }
}

export default function annotate(value: mixed, annotation?: string): Annotation {
    return _annotate(value, annotation, new WeakSet());
}

// NOTE: Don't acces theses private APIs directly. They are only exported here
// to better enable unit testing.
export { _annotate as __private_annotate, _annotateFields as __private_annotateFields };
