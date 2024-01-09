// All built-in decoders
export { array, nonEmptyArray, poja, tuple } from './arrays';
export { always, constant, fail, never, unknown } from './basics';
export { null_, nullable, nullish, optional, undefined_ } from './basics';
export { boolean, truthy } from './booleans';
export { mapping, record, set, setFromArray } from './collections';
export { date, datelike, iso8601 } from './dates';
export type { JSONArray, JSONObject, JSONValue } from './json';
export { json, jsonArray, jsonObject } from './json';
export { instanceOf, lazy, prep } from './misc';
export { anyNumber, integer, number, positiveInteger, positiveNumber } from './numbers';
export { bigint } from './numbers';
export { exact, inexact, object, pojo } from './objects';
export { nonEmptyString, regex, string } from './strings';
export { email, httpsUrl, url, uuid, uuidv1, uuidv4 } from './strings';
export { decimal, hexadecimal, numeric } from './strings';
export { either, enum_, oneOf, select, taggedUnion } from './unions';

// Core functionality
export type { Decoder, DecodeResult, DecoderType } from '~/core';
export type { Err, Ok, Result } from '~/core';
export type { Formatter } from '~/core';
export { define } from '~/core';
export { err, ok } from '~/core';
export { formatInline, formatShort } from '~/core';
export type { Scalar } from '~/lib/types';

// Deprecated aliases (will get removed in a future version)
export { hardcoded, maybe, mixed } from './basics';
export { numericBoolean } from './booleans';
export { dict } from './collections';
