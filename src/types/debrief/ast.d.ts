export interface ScalarAnnotation {
    type: 'ScalarAnnotation';
    value: unknown;
    annotation?: string;
}
export interface AnnPair {
    key: string;
    value: Annotation;
}
export interface ObjectAnnotation {
    type: 'ObjectAnnotation';
    pairs: AnnPair[];
    annotation?: string;
}
export interface ArrayAnnotation {
    type: 'ArrayAnnotation';
    items: Annotation[];
    annotation?: string;
}
export interface FunctionAnnotation {
    type: 'FunctionAnnotation';
    annotation?: string;
}
export interface CircularRefAnnotation {
    type: 'CircularRefAnnotation';
    annotation?: string;
}
export type Annotation =
    | ObjectAnnotation
    | ArrayAnnotation
    | ScalarAnnotation
    | FunctionAnnotation
    | CircularRefAnnotation;
export function asAnnotation(thing: unknown): Annotation | undefined;
export function isAnnotation(thing: unknown): boolean;
