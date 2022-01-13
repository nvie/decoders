import { Annotation } from './annotate';

export function asDate(value: unknown): Date | null;
export function isMultiline(s: string): boolean;
export function indent(s: string, prefix?: string): string;
export function summarize(
    ann: Annotation,
    keypath?: ReadonlyArray<number | string>,
): string[];
