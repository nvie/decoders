// @flow strict

type cast = $FlowFixMe;

export type ScalarAnnotation = {
    type: 'ScalarAnnotation',
    value: mixed,
    annotation?: string,
};

export type FunctionAnnotation = {
    type: 'FunctionAnnotation',
    annotation?: string,
};

export type CircularRefAnnotation = {
    type: 'CircularRefAnnotation',
    annotation?: string,
};

export type AnnPair = { key: string, value: Annotation };

export type ObjectAnnotation = {
    type: 'ObjectAnnotation',
    pairs: Array<AnnPair>,
    annotation?: string,
};

export type ArrayAnnotation = {
    type: 'ArrayAnnotation',
    items: Array<Annotation>,
    annotation?: string,
};

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;

export function asAnnotation(thing: mixed): Annotation | void {
    if (typeof thing === 'object' && thing !== null) {
        if (thing.type === 'ObjectAnnotation') {
            return ((thing: cast): ObjectAnnotation);
        } else if (thing.type === 'ArrayAnnotation') {
            return ((thing: cast): ArrayAnnotation);
        } else if (thing.type === 'ScalarAnnotation') {
            return ((thing: cast): ScalarAnnotation);
        } else if (thing.type === 'FunctionAnnotation') {
            return ((thing: cast): FunctionAnnotation);
        } else if (thing.type === 'CircularRefAnnotation') {
            return ((thing: cast): CircularRefAnnotation);
        }
    }
    return undefined;
}

export function isAnnotation(thing: mixed): boolean {
    return asAnnotation(thing) !== undefined;
}
