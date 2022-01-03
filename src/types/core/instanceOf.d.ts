import { Decoder } from '../_types';

export function instanceOf<T>(klass: new (...args: readonly any[]) => T): Decoder<T>;
