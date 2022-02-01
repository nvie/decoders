export { DecodeResult, Decoder, DecoderType, Scalar, define } from './Decoder';
export { JSONValue, JSONObject, JSONArray } from './lib/json';

export {
    always,
    constant,
    hardcoded,
    maybe,
    mixed,
    nullable,
    null_,
    optional,
    undefined_,
    unknown,
} from './lib/basics';
export { array, nonEmptyArray, poja, set, tuple } from './lib/arrays';
export { boolean, numericBoolean, truthy } from './lib/booleans';
export { date, iso8601 } from './lib/dates';
export { dict, exact, inexact, mapping, object, pojo } from './lib/objects';
export { either, oneOf, taggedUnion } from './lib/unions';
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
export { fail, instanceOf, lazy, never, prep } from './lib/utilities';
export {
    anyNumber,
    integer,
    number,
    positiveInteger,
    positiveNumber,
} from './lib/numbers';
export { json, jsonObject, jsonArray } from './lib/json';
