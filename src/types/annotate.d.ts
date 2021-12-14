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

export function object(
    fields: { readonly [key: string]: Annotation },
    text?: string,
): ObjectAnnotation;
export function array(items: readonly Annotation[], text?: string): ArrayAnnotation;
export function func(text?: string): FunctionAnnotation;
export function unknown(value: unknown, text?: string): UnknownAnnotation;
export function scalar(value: unknown, text?: string): ScalarAnnotation;
export function circularRef(text?: string): CircularRefAnnotation;
export function updateText<A extends Annotation>(annotation: A, text?: string): A;
export function merge(
    objAnnotation: ObjectAnnotation,
    fields: { readonly [key: string]: Annotation },
): ObjectAnnotation;
export function asAnnotation(thing: unknown): Annotation | void;
export function annotate(value: unknown, text?: string): Annotation;
export function annotateObject(
    obj: { readonly [field: string]: unknown },
    text?: string,
): ObjectAnnotation;
