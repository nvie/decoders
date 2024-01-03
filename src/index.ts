export type { Decoder, DecodeResult, DecoderType, Scalar } from './Decoder';
export type { JSONValue, JSONObject, JSONArray } from './lib/json';

export { define } from './Decoder';

export {
  always,
  constant,
  fail,
  never,
  nullable,
  nullish,
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
export { instanceOf, lazy, prep } from './lib/utilities';
export {
  anyNumber,
  integer,
  number,
  positiveInteger,
  positiveNumber,
} from './lib/numbers';
export { json, jsonObject, jsonArray } from './lib/json';

// Deprecated aliases
export { hardcoded, maybe, mixed } from './lib/basics';

// Previously to be imported from "decoders/format"
export type { Formatter } from './format';
export { formatInline, formatShort } from './format';

// Previously to be imported from "decoders/result"
export type { Result, Ok, Err } from './result';
export { ok, err } from './result';
