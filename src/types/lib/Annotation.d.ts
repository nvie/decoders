export interface ObjectAnnotation {
    type: 'object';
    fields: { [key: string]: Annotation };
    text?: string;
}

export interface ArrayAnnotation {
    type: 'array';
    items: readonly Annotation[];
    text?: string;
}

export interface ScalarAnnotation {
    type: 'scalar';
    value: unknown;
    text?: string;
}

export interface FunctionAnnotation {
    type: 'function';
    text?: string;
}

export interface CircularRefAnnotation {
    type: 'circular-ref';
    text?: string;
}

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;

export function object(
    fields: { [key: string]: Annotation },
    text?: string,
): ObjectAnnotation;
export function array(items: readonly Annotation[], text?: string): ArrayAnnotation;
export function func(text?: string): FunctionAnnotation;
export function scalar(value: unknown, text?: string): ScalarAnnotation;
export function circularRef(text?: string): CircularRefAnnotation;

export function updateText<A extends Annotation>(annotation: A, text?: string): A;

export function updateField(
    objAnnotation: ObjectAnnotation,
    key: string,
    textOrAnnotation: string | Annotation,
): ObjectAnnotation;

export function asAnnotation(thing: unknown): Annotation | void;

export function annotate(value: unknown, text?: string): Annotation;
