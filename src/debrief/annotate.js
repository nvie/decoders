// @flow strict

import * as Ann from './Annotation';
import type {
    Annotation,
    ArrayAnnotation,
    CircularRefAnnotation,
    ObjectAnnotation,
} from './Annotation';

type RefSet = WeakSet<{ ... } | $ReadOnlyArray<mixed>>;

function annotateArray(
    value: $ReadOnlyArray<mixed>,
    text?: string,
    seen: RefSet,
): ArrayAnnotation | CircularRefAnnotation {
    seen.add(value);

    const items = value.map((v) => annotate(v, undefined, seen));
    return Ann.array(items, text);
}

function annotateObject(
    object: {| +[string]: mixed |},
    text?: string,
    seen: RefSet,
): ObjectAnnotation {
    seen.add(object);

    const fields = {};
    Object.keys(object).forEach((key) => {
        const value = object[key];
        fields[key] = annotate(value, undefined, seen);
    });
    return Ann.object(fields, text);
}

function annotate(value: mixed, text?: string, seen: RefSet): Annotation {
    if (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'symbol' ||
        typeof value.getMonth === 'function'
    ) {
        return Ann.scalar(value, text);
    }

    const ann = Ann.asAnnotation(value);
    if (ann) {
        return Ann.updateText(ann, text);
    }

    if (Array.isArray(value)) {
        // "Circular references" can only exist in objects or arrays
        if (seen.has(value)) {
            return Ann.circularRef(text);
        } else {
            return annotateArray(value, text, seen);
        }
    }

    if (typeof value === 'object') {
        // "Circular references" can only exist in objects or arrays
        if (seen.has(value)) {
            return Ann.circularRef(text);
        } else {
            return annotateObject(value, text, seen);
        }
    }

    // istanbul ignore else
    if (typeof value === 'function') {
        return Ann.func(text);
    } else {
        throw new Error('Unknown annotation');
    }
}

function public_annotate(value: mixed, text?: string): Annotation {
    return annotate(value, text, new WeakSet());
}

export {
    // This construct just ensures the "seen" weakmap (used for circular
    // reference detection) isn't made part of the public API.
    public_annotate as annotate,
    //
    // NOTE: Don't acces theses private APIs directly. They are only exported here
    // to better enable unit testing.
    annotate as __private_annotate,
};
