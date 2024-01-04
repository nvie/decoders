// All built-in decoders
export { array, nonEmptyArray, poja, set, tuple } from './arrays';
export {
  always,
  constant,
  fail,
  never,
  null_,
  nullable,
  nullish,
  optional,
  undefined_,
  unknown,
} from './basics';
export { boolean, numericBoolean, truthy } from './booleans';
export { date, iso8601 } from './dates';
export type { JSONArray, JSONObject, JSONValue } from './json';
export { json, jsonArray, jsonObject } from './json';
export { instanceOf, lazy, prep } from './misc';
export { anyNumber, integer, number, positiveInteger, positiveNumber } from './numbers';
export { bigint } from './numbers';
export { dict, exact, inexact, mapping, object, pojo } from './objects';
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
} from './strings';
export { either, oneOf, taggedUnion } from './unions';

// Core functionality
export type { Decoder, DecodeResult, DecoderType } from '~/core';
export type { Err, Ok, Result } from '~/core';
export type { Formatter } from '~/core';
export { define } from '~/core';
export { err, ok } from '~/core';
export { formatInline, formatShort } from '~/core';
export type { Scalar } from '~/lib/types';

// Deprecated aliases
export { hardcoded, maybe, mixed } from './basics';
