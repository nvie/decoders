import { Decoder } from './types';

export function instanceOf<T>(klass: new (...args: any) => T): Decoder<T>;
