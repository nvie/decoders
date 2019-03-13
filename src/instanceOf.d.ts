import { Decoder } from './types';

// TODO: Fix bug in this declaration. Not sure how to express the equivalent of
// this in Flow:
//   export function instanceOf<T>(klass: Class<T>): Decoder<T>
export function instanceOf<T>(klass: new () => T): Decoder<T>;
