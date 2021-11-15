import { Annotation } from './ast';

export type Keypath = Array<number | string>;

export default function summarize(ann: Annotation, keypath?: Keypath): string[];
