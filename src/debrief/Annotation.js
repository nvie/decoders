// @flow strict

type cast = $FlowFixMe;

const __owner: symbol = Symbol('__decoders__');

export type ObjectAnnotation = {|
    +__owner: typeof __owner,
    +_type: 'object',
    +fields: {| +[key: string]: Annotation |},
    +text?: string,
|};

export type ArrayAnnotation = {|
    +__owner: typeof __owner,
    +_type: 'array',
    +items: $ReadOnlyArray<Annotation>,
    +text?: string,
|};

export type ScalarAnnotation = {|
    +__owner: typeof __owner,
    +_type: 'scalar',
    +value: mixed,
    +text?: string,
|};

export type FunctionAnnotation = {|
    +__owner: typeof __owner,
    +_type: 'function',
    +text?: string,
|};

export type CircularRefAnnotation = {|
    +__owner: typeof __owner,
    +_type: 'circular-ref',
    +text?: string,
|};

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;

export function object(
    fields: {| +[key: string]: Annotation |},
    text?: string,
): ObjectAnnotation {
    return {
        __owner,
        _type: 'object',
        fields,
        text,
    };
}

/**
 * Given an existing Annotation, set the annotation's text to a new value.
 */
export function updateText<A: Annotation>(annotation: A, text?: string): A {
    return text !== undefined
        ? { ...annotation, text }
        : // no-op
          annotation;
}

/**
 * Given an existing ObjectAnnotation, set the given field's annotation to
 * a new value. If the field does not exist, it is inserted.
 */
export function updateField(
    objAnnotation: ObjectAnnotation,
    key: string,
    textOrAnnotation: string | Annotation,
): ObjectAnnotation {
    const valueAnnotation =
        typeof textOrAnnotation === 'string'
            ? updateText(objAnnotation.fields[key] ?? scalar(undefined), textOrAnnotation)
            : textOrAnnotation;
    return {
        __owner,
        _type: 'object',
        fields: {
            ...objAnnotation.fields,
            [key]: valueAnnotation,
        },
        text: objAnnotation.text,
    };
}

export function array(items: $ReadOnlyArray<Annotation>, text?: string): ArrayAnnotation {
    return {
        __owner,
        _type: 'array',
        items,
        text,
    };
}

export function func(text?: string): FunctionAnnotation {
    return {
        __owner,
        _type: 'function',
        text,
    };
}

export function scalar(value: mixed, text?: string): ScalarAnnotation {
    return {
        __owner,
        _type: 'scalar',
        value,
        text,
    };
}

export function circularRef(text?: string): CircularRefAnnotation {
    return {
        __owner,
        _type: 'circular-ref',
        text,
    };
}

export function asAnnotation(thing: mixed): Annotation | void {
    return typeof thing === 'object' && thing !== null && thing.__owner === __owner
        ? ((thing: cast): Annotation)
        : undefined;
}
