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
export type {
    Decoder,
    DecodeResult,
    DecoderType,
    Guard,
    GuardType,
    Predicate,
    Scalar,
} from './_types';
export type { Result } from './result';
export type { JSONValue, JSONObject, JSONArray } from './core/json';

export { guard } from './_guard';

export { compose, map, predicate, prep } from './core/composition';

export { array, nonEmptyArray, poja } from './core/array';
export { boolean, numericBoolean, truthy } from './core/boolean';
export { constant, hardcoded, mixed, null_, undefined_, unknown } from './core/constants';
export { date, iso8601 } from './core/date';
export { describe } from './core/describe';
export { disjointUnion } from './core/dispatch';
export { either, oneOf } from './core/either';
export { fail } from './core/fail';
export { instanceOf } from './core/instanceOf';
export { json, jsonObject, jsonArray } from './core/json';
export { lazy } from './core/lazy';
export { mapping, dict } from './core/mapping';
export { integer, number, positiveInteger, positiveNumber } from './core/number';
export { exact, inexact, object, pojo } from './core/object';
export { maybe, nullable, optional } from './core/optional';
export { email, httpsUrl, nonEmptyString, regex, string, url } from './core/string';
export { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from './core/tuple';
