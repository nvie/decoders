export {
    DecodeResult,
    Decoder,
    DecoderType,
    Predicate,
    Scalar,
    define,
} from './_decoder';
export { JSONValue, JSONObject, JSONArray } from './lib/json';

export { prep } from './lib/composition';

export {
    always,
    constant,
    hardcoded,
    mixed,
    null_,
    undefined_,
    unknown,
} from './lib/constants';
export { array, nonEmptyArray, poja, set, tuple } from './lib/arrays';
export { boolean, numericBoolean, truthy } from './lib/booleans';
export { date, iso8601 } from './lib/dates';
export { dict, exact, inexact, mapping, object, pojo } from './lib/objects';
export { either, oneOf } from './lib/either';
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
} from './lib/strings';
export { fail, never } from './lib/never';
export { instanceOf } from './lib/instanceOf';
export { integer, number, positiveInteger, positiveNumber } from './lib/numbers';
export { json, jsonObject, jsonArray } from './lib/json';
export { lazy } from './lib/lazy';
export { maybe, nullable, optional } from './lib/optional';
export { taggedUnion } from './lib/dispatch';
