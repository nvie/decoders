import { Decoder } from '../_decoder';

export function instanceOf<T>(klass: new (...args: readonly any[]) => T): Decoder<T>;
