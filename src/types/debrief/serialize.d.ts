import { AnnPair, Annotation } from './types';
import { INDENT, indent, isMultiline } from './utils';

export function serializeValue(value: unknown): string;
export function serializeAnnotation(
    ann: Annotation,
    prefix?: string,
): [string, string | undefined];
export default function serialize(ann: Annotation): string;
