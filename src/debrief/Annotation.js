// @flow strict

type cast = $FlowFixMe;

export type ObjectAnnotation = {|
    +_type: 'object',
    +pairs: $ReadOnlyArray<{|
        +key: string,
        +value: Annotation,
    |}>,
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
    pairs: $ReadOnlyArray<{|
        +key: string,
        +value: Annotation,
    |}>,
    text?: string,
): ObjectAnnotation {
    return { _type: 'object', pairs, text };
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

export function isAnnotation(thing: mixed): boolean {
    return asAnnotation(thing) !== undefined;
}
