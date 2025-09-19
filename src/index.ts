// All built-in decoders
export { array, nonEmptyArray, poja, tuple } from './arrays';
export { always, anything, constant, fail, never, unknown } from './basics';
export { null_, nullable, nullish, optional, undefined_ } from './basics';
export { boolean, truthy } from './booleans';
export { mapping, record, setFromArray } from './collections';
export { date, datelike, dateString, iso8601 } from './dates';
export type { JSONArray, JSONObject, JSONValue } from './json';
export { json, jsonArray, jsonObject } from './json';
export type { SizeOptions } from './lib/size-options';
export { instanceOf, lazy, prep } from './misc';
export { anyNumber, integer, number, positiveInteger, positiveNumber } from './numbers';
export { bigint } from './numbers';
export { exact, inexact, object, pojo } from './objects';
export { endsWith, nonEmptyString, regex, startsWith, string } from './strings';
export { identifier, nanoid, uuid, uuidv1, uuidv4 } from './strings';
export { email, httpsUrl, url } from './strings';
export { decimal, hexadecimal, numeric } from './strings';
export { either, enum_, oneOf, select, taggedUnion } from './unions';

// Core functionality
export type {
  Decoder,
  DecodeResult,
  DecoderType,
  Err,
  Formatter,
  Ok,
  Result,
} from '~/core';
export { define, err, formatInline, formatShort, isDecoder, ok } from '~/core';
export type { Scalar } from '~/lib/types';
