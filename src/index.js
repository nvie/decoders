// @flow strict

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
export type { Decoder, Guard } from './_types';
export type { DecoderType, GuardType } from './_types';

export type { JSONValue, JSONObject, JSONArray } from './stdlib/json';

export { guard } from './_guard';

export { compose, map, predicate } from './stdlib/composition';

export { array, nonEmptyArray, poja } from './stdlib/array';
export { boolean, numericBoolean, truthy } from './stdlib/boolean';
export {
    constant,
    hardcoded,
    mixed,
    null_,
    undefined_,
    unknown,
} from './stdlib/constants';
export { date, iso8601 } from './stdlib/date';
export { describe } from './stdlib/describe';
export { dispatch } from './stdlib/dispatch';
export {
    either,
    either3,
    either4,
    either5,
    either6,
    either7,
    either8,
    either9,
    oneOf,
} from './stdlib/either';
export { fail } from './stdlib/fail';
export { instanceOf } from './stdlib/instanceOf';
export { json, jsonObject, jsonArray } from './stdlib/json';
export { lazy } from './stdlib/lazy';
export { mapping, dict } from './stdlib/mapping';
export { integer, number, positiveInteger, positiveNumber } from './stdlib/number';
export { exact, inexact, object, pojo } from './stdlib/object';
export { maybe, nullable, optional } from './stdlib/optional';
export { email, nonEmptyString, regex, string, url } from './stdlib/string';
export { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from './stdlib/tuple';
