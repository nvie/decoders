// @flow

/**
 * Elm-like JSON decoders, for use with Flow.
 * See http://elmplayground.com/decoding-json-in-elm-1 for an introduction.
 *
 * Why? All JSON responses coming from our API endpoints are just that: free-form
 * JSON data.  To Flow, the only type classification possilbe is "any" -- effectively
 * turning off all type checks for anything related to JSON.  To the receiving end
 * (our frontend), the structure of that data is completely opaque to any type
 * checkers since JSON values can be anything: an object, an array, null, a string,
 * a bool, etc.  Our type system is not a runtime type system, so we need a way of
 * "converting" an any-type JSON value into a type that we want to work with in our
 * frontend code base.
 *
 * Elm's solution to this problem is to define composable decoders: functions that
 * take anything and either fail with an error, or guarantee to return the expected
 * type.  In our case, it's fine to fail with a runtime error.
 *
 */
import type { Decoder, Guard } from './types';

export { guard } from './guard';
export { compose, map, predicate } from './utils';

export { array, poja } from './array';
export { boolean, numericBoolean, truthy } from './boolean';
export { constant, hardcoded, mixed, null_, undefined_ } from './constants';
export { date } from './date';
export { dispatch } from './dispatch';
export { either, either3, either4, either5, either6, either7, either8, either9 } from './either';
export { fail } from './fail';
export { mapping } from './mapping';
export { nullable } from './nullable';
export { integer, number, positiveInteger, positiveNumber } from './number';
export { exact, field, object, pojo } from './object';
export { optional } from './optional';
export { email, regex, string, url } from './string';
export { tuple2 } from './tuple';

export type { Guard, Decoder };
