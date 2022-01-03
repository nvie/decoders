export {
    DecodeResult,
    Decoder,
    DecoderType,
    Predicate,
    Scalar,
    define,
} from './_decoder';
export { JSONValue, JSONObject, JSONArray } from './core/json';

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
