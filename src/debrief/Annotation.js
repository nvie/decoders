// @flow strict

type cast = $FlowFixMe;

export type ObjectAnnotation = {|
    +_type: 'object',
    +fields: {| +[key: string]: Annotation |},
    +text?: string,
|};

export type ArrayAnnotation = {|
    +_type: 'array',
    +items: $ReadOnlyArray<Annotation>,
    +text?: string,
|};

export type ScalarAnnotation = {|
    +_type: 'scalar',
    +value: mixed,
    +text?: string,
|};

export type FunctionAnnotation = {|
    +_type: 'function',
    +text?: string,
|};

export type CircularRefAnnotation = {|
    +_type: 'circular-ref',
    +text?: string,
|};

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;

// TODO: Refactor this away
export type __LEGACY_FieldAnnotation = CircularRefAnnotation | ObjectAnnotation;

export function object(
    fields: {| +[key: string]: Annotation |},
    text?: string,
): ObjectAnnotation {
    return { _type: 'object', fields, text };
}

/**
 * Given an existing Annotation, set the annotation's text to a new value.
 */
// export function updateText<A: Annotation>(annotation: A, text: string): A {
//     return { ...annotation, text };
// }

/**
 * Given an existing ObjectAnnotation, set the given field's annotation to
 * a new value. If the field does not exist, it is inserted.
 */
// export function updateField(
//     annotation: ObjectAnnotation,
//     key: string,
//     value: Annotation
// ): ObjectAnnotation {
//     const { text } = annotation;
//     return {
//         _type: 'object',
//         fields: { ...annotation.fields, [key]: value },
//         text,
//     };
// }

export function array(items: $ReadOnlyArray<Annotation>, text?: string): ArrayAnnotation {
    return { _type: 'array', items, text };
}

export function func(text?: string): FunctionAnnotation {
    return { _type: 'function', text };
}

export function scalar(value: mixed, text?: string): ScalarAnnotation {
    return { _type: 'scalar', value, text };
}

export function circularRef(text?: string): CircularRefAnnotation {
    return { _type: 'circular-ref', text };
}

//
// TODO: This is used in cases where we "throw" an Annotation instance, which
// will make it "mixed". We then need this message to "decode" the mixed value
// back to an Annotation instance. Of course... we cannot use decoder here
// because, well, we're building the decoders library here ;)
//
// TODO: The solution is most likely to stop throwing those and just use Result
// semantics instead? Look into whether that is possible.
//
export function asAnnotation(thing: mixed): Annotation | void {
    if (typeof thing === 'object' && thing !== null) {
        if (thing._type === 'object') {
            return ((thing: cast): ObjectAnnotation);
        } else if (thing._type === 'array') {
            return ((thing: cast): ArrayAnnotation);
        } else if (thing._type === 'scalar') {
            return ((thing: cast): ScalarAnnotation);
        } else if (thing._type === 'function') {
            return ((thing: cast): FunctionAnnotation);
        } else if (thing._type === 'circular-ref') {
            return ((thing: cast): CircularRefAnnotation);
        }
    }
    return undefined;
}

// TODO: How is this used? Is this still needed?
export function isAnnotation(thing: mixed): boolean {
    return asAnnotation(thing) !== undefined;
}
