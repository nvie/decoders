// @flow strict

import * as Ann from './Annotation';
import type {
    __LEGACY_FieldAnnotation,
    Annotation,
    ObjectAnnotation,
} from './Annotation';

type RefSet = WeakSet<{ ... } | $ReadOnlyArray<mixed>>;

function _annotateFields(
    object: { +[string]: mixed, ... },
    fields: $ReadOnlyArray<[/* key */ string, string | Annotation]>,
    seen: RefSet,
): __LEGACY_FieldAnnotation {
    if (seen.has(object)) {
        return Ann.circularRef();
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

// TODO: This should not be a public API
export function annotateFields(
    object: { +[string]: mixed, ... },
    fields: $ReadOnlyArray<[/* key */ string, string | Annotation]>,
): __LEGACY_FieldAnnotation {
    return _annotateFields(object, fields, new WeakSet());
}

function _annotatePairs(
    pairs: Array<[string, mixed]>,
    text?: string,
    seen: RefSet,
): ObjectAnnotation {
    const fields = {};
    pairs.forEach((pair) => {
        const [key, value] = pair;
        fields[key] = _annotate(value, undefined, seen);
    });
    return Ann.object(fields, text);
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
        return Ann.scalar(value, text);
    }

    const ann = Ann.asAnnotation(value);
    // istanbul ignore else
    if (ann) {
        if (text === undefined) {
            return ann;
        } else if (ann._type === 'object') {
            return Ann.object(ann.fields, text);
        } else if (ann._type === 'array') {
            return Ann.array(ann.items, text);
        } else if (ann._type === 'function') {
            return Ann.func(text);
        } else if (ann._type === 'circular-ref') {
            return Ann.circularRef(text);
        } else {
            return Ann.scalar(ann.value, text);
        }
    } else if (Array.isArray(value)) {
        if (seen.has(value)) {
            return Ann.circularRef(text);
        } else {
            seen.add(value);
        }
        const items = value.map((v) => _annotate(v, undefined, seen));
        return Ann.array(items, text);
    } else if (typeof value === 'object') {
        if (seen.has(value)) {
            return Ann.circularRef(text);
        } else {
            seen.add(value);
        }
        return _annotatePairs(Object.entries(value), text, seen);
    } else if (typeof value === 'function') {
        return Ann.func(text);
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
