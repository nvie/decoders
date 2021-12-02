export { Decoder, Guard } from './_types';
export { DecoderType, GuardType } from './_types';

export { guard } from './_guard';
export { compose, map, predicate } from './_utils';

export { JSONArray, JSONObject, JSONValue } from './stdlib/json';

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
export { json, jsonArray, jsonObject } from './stdlib/json';
export { lazy } from './stdlib/lazy';
export { mapping, dict } from './stdlib/mapping';
export { integer, number, positiveInteger, positiveNumber } from './stdlib/number';
export { exact, inexact, object, pojo } from './stdlib/object';
export { maybe, nullable, optional } from './stdlib/optional';
export { email, nonEmptyString, regex, string, url } from './stdlib/string';
export { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from './stdlib/tuple';
