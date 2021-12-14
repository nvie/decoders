import { Decoder } from '../_types';

export function instanceOf<T>(klass: new (...args: any) => T): Decoder<T>;
