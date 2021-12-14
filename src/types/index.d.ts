export {
    Decoder,
    DecodeResult,
    DecoderType,
    Guard,
    GuardType,
    Predicate,
    Scalar,
} from './_types';
export { Result } from './result';
export { JSONValue, JSONObject, JSONArray } from './core/json';

export { guard } from './_guard';

export { compose, map, predicate } from './core/composition';

export { array, nonEmptyArray, poja } from './core/array';
export { boolean, numericBoolean, truthy } from './core/boolean';
export { constant, hardcoded, mixed, null_, undefined_, unknown } from './core/constants';
export { date, iso8601 } from './core/date';
export { describe } from './core/describe';
export { dispatch } from './core/dispatch';
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
} from './core/either';
export { fail } from './core/fail';
export { instanceOf } from './core/instanceOf';
export { json, jsonObject, jsonArray } from './core/json';
export { lazy } from './core/lazy';
export { mapping, dict } from './core/mapping';
export { integer, number, positiveInteger, positiveNumber } from './core/number';
export { exact, inexact, object, pojo } from './core/object';
export { maybe, nullable, optional } from './core/optional';
export { email, nonEmptyString, regex, string, url } from './core/string';
export { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from './core/tuple';
