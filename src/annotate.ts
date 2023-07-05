import { isPojo } from './_utils';

const _register: WeakSet<Annotation> = new WeakSet();

export interface ObjectAnnotation {
    readonly type: 'object';
    readonly fields: { readonly [key: string]: Annotation };
    readonly text?: string;
}

export interface ArrayAnnotation {
    readonly type: 'array';
    readonly items: readonly Annotation[];
    readonly text?: string;
}

export interface ScalarAnnotation {
    readonly type: 'scalar';
    readonly value: unknown;
    readonly text?: string;
}

export interface FunctionAnnotation {
    readonly type: 'function';
    readonly text?: string;
}

export interface CircularRefAnnotation {
    readonly type: 'circular-ref';
    readonly text?: string;
}

export interface UnknownAnnotation {
    readonly type: 'unknown';
    readonly value: unknown;
    readonly text?: string;
}

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation
    | UnknownAnnotation;

function brand<A extends Annotation>(ann: A): A {
    _register.add(ann);
    return ann;
}

export function object(
    fields: { readonly [key: string]: Annotation },
    text?: string,
): ObjectAnnotation {
    return brand({ type: 'object', fields, text });
}

export function array(items: readonly Annotation[], text?: string): ArrayAnnotation {
    return brand({
        type: 'array',
        items,
        text,
    });
}

export function func(text?: string): FunctionAnnotation {
    return brand({
        type: 'function',
        text,
    });
}

export function unknown(value: unknown, text?: string): UnknownAnnotation {
    return brand({
        type: 'unknown',
        value,
        text,
    });
}

export function scalar(value: unknown, text?: string): ScalarAnnotation {
    return brand({
        type: 'scalar',
        value,
        text,
    });
}

export function circularRef(text?: string): CircularRefAnnotation {
    return brand({
        type: 'circular-ref',
        text,
    });
}

/**
 * Given an existing Annotation, set the annotation's text to a new value.
 */
export function updateText<A extends Annotation>(annotation: A, text?: string): A {
    if (text !== undefined) {
        return brand({ ...annotation, text });
    } else {
        return annotation;
    }
}

/**
 * Given an existing ObjectAnnotation, merges new Annotations in there.
 */
export function merge(
    objAnnotation: ObjectAnnotation,
    fields: { readonly [key: string]: Annotation },
): ObjectAnnotation {
    const newFields = { ...objAnnotation.fields, ...fields };
    return object(newFields, objAnnotation.text);
}

export function asAnnotation(thing: unknown): Annotation | undefined {
    return typeof thing === 'object' &&
        thing !== null &&
        _register.has(thing as Annotation)
        ? (thing as Annotation)
        : undefined;
}

type RefSet = WeakSet<object>;

/** @internal */
function annotateArray(
    value: readonly unknown[],
    text: string | undefined,
    seen: RefSet,
): ArrayAnnotation | CircularRefAnnotation {
    seen.add(value);

    const items = value.map((v) => annotate(v, undefined, seen));
    return array(items, text);
}

/** @internal */
function annotateObject(
    obj: Record<string, unknown>,
    text: string | undefined,
    seen: RefSet,
): ObjectAnnotation {
    seen.add(obj);

    const fields: Record<string, Annotation> = {};
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        fields[key] = annotate(value, undefined, seen);
    });
    return object(fields, text);
}

/** @internal */
function annotate(value: unknown, text: string | undefined, seen: RefSet): Annotation {
    if (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'symbol' ||
        typeof (value as Record<string, unknown>).getMonth === 'function'
    ) {
        return scalar(value, text);
    }

    const ann = asAnnotation(value);
    if (ann) {
        return updateText(ann, text);
    }

    if (Array.isArray(value)) {
        // "Circular references" can only exist in objects or arrays
        if (seen.has(value)) {
            return circularRef(text);
        } else {
            return annotateArray(value, text, seen);
        }
    }

    if (isPojo(value)) {
        // "Circular references" can only exist in objects or arrays
        if (seen.has(value)) {
            return circularRef(text);
        } else {
            return annotateObject(value, text, seen);
        }
    }

    if (typeof value === 'function') {
        return func(text);
    }

    return unknown(value, text);
}

function public_annotate(value: unknown, text?: string): Annotation {
    return annotate(value, text, new WeakSet());
}

function public_annotateObject(
    obj: { readonly [field: string]: unknown },
    text?: string,
): ObjectAnnotation {
    return annotateObject(obj, text, new WeakSet());
}

export {
    // This construct just ensures the "seen" weakmap (used for circular
    // reference detection) isn't made part of the public API.
    public_annotate as annotate,
    public_annotateObject as annotateObject,

    /** @internal */
    annotate as __private_annotate,
};
