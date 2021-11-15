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

export function object(
    fields: {| +[key: string]: Annotation |},
    text?: string,
): ObjectAnnotation {
    return { _type: 'object', fields, text };
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
        _type: 'object',
        fields: {
            ...objAnnotation.fields,
            [key]: valueAnnotation,
        },
        text: objAnnotation.text,
    };
}

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
