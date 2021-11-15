import { Annotation } from './types';

export type Keypath = Array<number | string>;

export default function summarize(ann: Annotation, keypath?: Keypath): string[];
