import { Annotation } from './annotate';

export type Formatter = (err: Annotation) => string | Error;

export function formatInline(err: Annotation): string;
export function formatShort(err: Annotation): string;
