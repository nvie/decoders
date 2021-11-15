// @flow strict

type cast = $FlowFixMe;

type ScalarAnnotation = {|
    +type: 'ScalarAnnotation',
    +value: mixed,
    +annotation?: string,
|};

type FunctionAnnotation = {|
    +type: 'FunctionAnnotation',
    +annotation?: string,
|};

// TODO: Remove this export - it should be an implementation detail!
export type CircularRefAnnotation = {|
    +type: 'CircularRefAnnotation',
    +annotation?: string,
|};

// TODO: Remove this export - it should be an implementation detail!
export type AnnPair = {|
    +key: string,
    +value: Annotation,
|};

// TODO: Remove this export - it should be an implementation detail!
export type ObjectAnnotation = {|
    +type: 'ObjectAnnotation',
    +pairs: Array<AnnPair>,
    +annotation?: string,
|};

type ArrayAnnotation = {|
    +type: 'ArrayAnnotation',
    +items: Array<Annotation>,
    +annotation?: string,
|};

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
