import { Decoder } from './types';

export function instanceOf<T>(klass: new () => T): Decoder<T>;
