// All built-in decoders
export { array, nonEmptyArray, poja, tuple } from './arrays.js';
export { always, constant, fail, never, unknown } from './basics.js';
export { null_, nullable, nullish, optional, undefined_ } from './basics.js';
export { boolean, truthy } from './booleans.js';
export { mapping, record, set, setFromArray } from './collections.js';
export { date, datelike, iso8601 } from './dates.js';
export type { JSONArray, JSONObject, JSONValue } from './json.js';
export { json, jsonArray, jsonObject } from './json.js';
export type { SizeOptions } from './lib/size-options.js';
export { instanceOf, lazy, prep } from './misc.js';
export {
  anyNumber,
  integer,
  number,
  positiveInteger,
  positiveNumber,
} from './numbers.js';
export { bigint } from './numbers.js';
export { exact, inexact, object, pojo } from './objects.js';
export { endsWith, nonEmptyString, regex, startsWith, string } from './strings.js';
export { identifier, nanoid, uuid, uuidv1, uuidv4 } from './strings.js';
export { email, httpsUrl, url } from './strings.js';
export { decimal, hexadecimal, numeric } from './strings.js';
export { either, enum_, oneOf, select, taggedUnion } from './unions.js';

// Core functionality
export type { Decoder, DecodeResult, DecoderType } from '~/core/index.js';
export type { Err, Ok, Result } from '~/core/index.js';
export type { Formatter } from '~/core/index.js';
export { define } from '~/core/index.js';
export { err, ok } from '~/core/index.js';
export { formatInline, formatShort } from '~/core/index.js';
export type { Scalar } from '~/lib/types.js';

// Deprecated aliases (will get removed in a future version)
export { hardcoded, maybe, mixed } from './basics.js';
export { dict } from './collections.js';
