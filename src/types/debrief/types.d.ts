export interface ScalarAnnotation {
    readonly type: 'ScalarAnnotation';
    readonly value: unknown;
    readonly text?: string;
}

export interface AnnPair {
    readonly key: string;
    readonly value: Annotation;
}

export interface ObjectAnnotation {
    readonly type: 'ObjectAnnotation';
    readonly pairs: AnnPair[];
    readonly text?: string;
}

export interface ArrayAnnotation {
    readonly type: 'ArrayAnnotation';
    readonly items: Annotation[];
    readonly text?: string;
}

export interface FunctionAnnotation {
    readonly type: 'FunctionAnnotation';
    readonly text?: string;
}

export interface CircularRefAnnotation {
    readonly type: 'CircularRefAnnotation';
    readonly text?: string;
}

export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;

export function asAnnotation(thing: unknown): Annotation | undefined;
export function isAnnotation(thing: unknown): boolean;
