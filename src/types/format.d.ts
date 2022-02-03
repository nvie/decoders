import { Annotation } from './annotate';

export type Formatter = (err: Annotation) => string | Error;

export const formatInline: Formatter;
export const formatShort: Formatter;
