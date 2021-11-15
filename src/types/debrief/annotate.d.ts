import { asAnnotation, Annotation, ObjectAnnotation } from './types';

export function annotateFields(
    obj: { [field: string]: unknown },
    fields: Array<[string, string | Annotation]>,
): ObjectAnnotation;
export default function annotate(value: unknown, text?: string): Annotation;
