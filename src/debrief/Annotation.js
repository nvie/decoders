// @flow strict

type cast = $FlowFixMe;

const _register: WeakSet<{ ... }> = new WeakSet();

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

function brand<A: Annotation>(ann: A): A {
    _register.add(ann);
    return ann;
}

export function object(
    fields: {| +[key: string]: Annotation |},
    text?: string,
): ObjectAnnotation {
    return brand({ _type: 'object', fields, text });
}

/**
 * Given an existing Annotation, set the annotation's text to a new value.
 */
export function updateText<A: Annotation>(annotation: A, text?: string): A {
    if (text !== undefined) {
        return brand({ ...annotation, text });
    } else {
        return annotation;
    }
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
    return brand({
        _type: 'object',
        fields: {
            ...objAnnotation.fields,
            [key]: valueAnnotation,
        },
        text: objAnnotation.text,
    });
}

export function array(items: $ReadOnlyArray<Annotation>, text?: string): ArrayAnnotation {
    return brand({
        _type: 'array',
        items,
        text,
    });
}

export function func(text?: string): FunctionAnnotation {
    return brand({
        _type: 'function',
        text,
    });
}

export function scalar(value: mixed, text?: string): ScalarAnnotation {
    return brand({
        _type: 'scalar',
        value,
        text,
    });
}

export function circularRef(text?: string): CircularRefAnnotation {
    return brand({
        _type: 'circular-ref',
        text,
    });
}

export function asAnnotation(thing: mixed): Annotation | void {
    return typeof thing === 'object' && thing !== null && _register.has(thing)
        ? ((thing: cast): Annotation)
        : undefined;
}
