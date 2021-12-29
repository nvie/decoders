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
export { tuple } from './core/tuple';
