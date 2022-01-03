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
export type { Decoder, DecodeResult, DecoderType, Predicate, Scalar } from './_decoder';
export type { JSONValue, JSONObject, JSONArray } from './core/json';

export { define } from './_decoder';

export { prep } from './core/composition';

export {
    always,
    constant,
    hardcoded,
    mixed,
    null_,
    undefined_,
    unknown,
} from './core/constants';
export { array, nonEmptyArray, poja, set, tuple } from './core/arrays';
export { boolean, numericBoolean, truthy } from './core/booleans';
export { date, iso8601 } from './core/dates';
export { dict, exact, inexact, mapping, object, pojo } from './core/objects';
export { either, oneOf } from './core/either';
export {
    email,
    httpsUrl,
    nonEmptyString,
    regex,
    string,
    url,
    uuid,
    uuidv1,
    uuidv4,
} from './core/strings';
export { fail, never } from './core/never';
export { instanceOf } from './core/instanceOf';
export { integer, number, positiveInteger, positiveNumber } from './core/numbers';
export { json, jsonObject, jsonArray } from './core/json';
export { lazy } from './core/lazy';
export { maybe, nullable, optional } from './core/optional';
export { taggedUnion } from './core/dispatch';
