// @flow strict

import { asAnnotation } from './ast';
import type { Annotation, CircularRefAnnotation, ObjectAnnotation } from './ast';

// NOTE: Deliberate use of `any` here, to match the Flow stdlib for WeakSet's
// T condition from /private/tmp/flow/flowlib_381b77f4/core.js, which says:
// declare class WeakSet<T: {...} | $ReadOnlyArray<any>> extends $ReadOnlyWeakSet<T> {
// $FlowFixMe[unclear-type]
type RefSet = WeakSet<{ ... } | $ReadOnlyArray<any>>;

export function annotateFields(
    object: { [string]: mixed, ... },
    fields: Array<[/* key */ string, string | Annotation]>,
    _seen?: RefSet,
): ObjectAnnotation | CircularRefAnnotation {
    const seen = _seen ?? new WeakSet();
    if (seen.has(object)) {
        return { type: 'CircularRefAnnotation', annotation: undefined };
    }
    seen.add(object);

    // Convert the object to a list of pairs
    let pairs = Object.entries(object);

    // If we want to annotate keys that are missing in the object, add an
    // explicit "undefined" value for those now, so we have a place in the
    // object to annotate
    const existingKeys = new Set(Object.keys(object));
    for (const [field] of fields) {
        if (!existingKeys.has(field)) {
            pairs.push([field, undefined]);
        }
    }

    for (const [field, ann] of fields) {
        // prettier-ignore
        pairs = pairs.map(([k, v]) => (
            field === k
                ? [
                    k,
                    typeof ann === 'string' ? annotate(v, ann, seen) : ann,
                ]
                : [k, v]
        ));
    }
    return annotatePairs(pairs, undefined, seen);
}

function annotatePairs(
    value: Array<[string, mixed]>,
    annotation?: string,
    seen?: RefSet,
): ObjectAnnotation {
    const pairs = value.map(([key, v]) => {
        return { key, value: annotate(v, undefined, seen) };
    });
    return { type: 'ObjectAnnotation', pairs, annotation };
}

export default function annotate(
    value: mixed,
    annotation?: string,
    _seen?: RefSet,
): Annotation {
    if (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value.getMonth === 'function'
    ) {
        return { type: 'ScalarAnnotation', value, annotation };
    }

    const ann = asAnnotation(value);
    // istanbul ignore else
    if (ann) {
        if (annotation === undefined) {
            return ann;
        } else if (ann.type === 'ObjectAnnotation') {
            return { type: 'ObjectAnnotation', pairs: ann.pairs, annotation };
        } else if (ann.type === 'ArrayAnnotation') {
            return { type: 'ArrayAnnotation', items: ann.items, annotation };
        } else if (ann.type === 'FunctionAnnotation') {
            return { type: 'FunctionAnnotation', annotation };
        } else if (ann.type === 'CircularRefAnnotation') {
            return { type: 'CircularRefAnnotation', annotation };
        } else {
            return { type: 'ScalarAnnotation', value: ann.value, annotation };
        }
    } else if (Array.isArray(value)) {
        const seen = _seen ?? new WeakSet();
        if (seen.has(value)) {
            return { type: 'CircularRefAnnotation', annotation };
        } else {
            seen.add(value);
        }
        const items = value.map((v) => annotate(v, undefined, seen));
        return { type: 'ArrayAnnotation', items, annotation };
    } else if (typeof value === 'object') {
        const seen = _seen ?? new WeakSet();
        if (seen.has(value)) {
            return { type: 'CircularRefAnnotation', annotation };
        } else {
            seen.add(value);
        }
        return annotatePairs(Object.entries(value), annotation, seen);
    } else if (typeof value === 'function') {
        return { type: 'FunctionAnnotation', annotation };
    } else {
        throw new Error('Unknown annotation');
    }
}
