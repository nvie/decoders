import { Decoder, DecoderType, Guard, GuardType } from './types';

export { guard } from './guard';
export { compose, map, predicate } from './utils';

export { array, nonEmptyArray, poja } from './array';
export { boolean, numericBoolean, truthy } from './boolean';
export { constant, hardcoded, mixed, null_, undefined_, unknown } from './constants';
export { date, iso8601 } from './date';
export { describe } from './describe';
export { dispatch } from './dispatch';
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
} from './either';
export { fail } from './fail';
export { instanceOf } from './instanceOf';
export { json, jsonArray, jsonObject } from './json';
export { lazy } from './lazy';
export { mapping, dict } from './mapping';
export { integer, number, positiveInteger, positiveNumber } from './number';
export { exact, inexact, object, pojo } from './object';
export { maybe, nullable, optional } from './optional';
export { email, nonEmptyString, regex, string, url } from './string';
export { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from './tuple';

export { Decoder, Guard };
export { DecoderType, GuardType };
export { JSONArray, JSONObject, JSONValue } from './json';

export type $DecoderType<T> = DecoderType<T>; // Alias for backward compatibility
