import type { Decoder } from '~/core';
import { define } from '~/core';
import type { SizeOptions } from '~/lib/size-options';
import { sized } from '~/misc';
import { isString } from '~/lib/utils';

import { instanceOf } from './misc';
import { select } from './unions';
import { unknown } from './basics';

/** Match groups in this regex:
 * \1 - the scheme
 * \2 - the username/password (optional)
 * \3 - the host
 * \4 - the port (optional)
 * \5 - the path (optional)
 */
const url_re =
  /* #__PURE__ */
  /^([A-Za-z]{2,12}(?:[+][A-Za-z]{2,12})?):\/\/(?:([^@:]*:?(?:[^@]+)?)@)?(?:([A-Za-z0-9.-]+)(?::([0-9]{2,5}))?)(\/(?:[-+~%/.,\w]*)?(?:\?[-+=&;%@.,/\w]*)?(?:#[.,!/\w]*)?)?$/;

/**
 * Accepts and returns strings.
 */
export const string: Decoder<string> = define((blob, ok, err) =>
  isString(blob) ? ok(blob) : err('Must be string'),
);

/**
 * Like `string`, but will reject the empty string or strings containing only whitespace.
 */
export const nonEmptyString: Decoder<string> = regex(/\S/, 'Must be non-empty string');

/**
 * Accepts and returns strings that match the given regular expression.
 */
/* #__NO_SIDE_EFFECTS__ */
export function regex(regex: RegExp, msg: string): Decoder<string> {
  return string.refine((s) => regex.test(s), msg);
}

/**
 * Accepts and returns strings that start with the given prefix.
 */
/* #__NO_SIDE_EFFECTS__ */
export function startsWith<P extends string>(prefix: P): Decoder<`${P}${string}`> {
  return string.refine(
    (s): s is `${P}${string}` => s.startsWith(prefix),
    `Must start with '${prefix}'`,
  );
}

/**
 * Accepts and returns strings that end with the given suffix.
 */
/* #__NO_SIDE_EFFECTS__ */
export function endsWith<S extends string>(suffix: S): Decoder<`${string}${S}`> {
  return string.refine(
    (s): s is `${string}${S}` => s.endsWith(suffix),
    `Must end with '${suffix}'`,
  );
}

/**
 * Accepts and returns strings that are syntactically valid email addresses.
 * (This will not mean that the email address actually exist.)
 */
export const email: Decoder<string> = /* #__PURE__ */ regex(
  // The almost perfect email regex, taken from https://emailregex.com/
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  'Must be email',
);

/**
 * Accepts strings that are valid URLs.
 */
export const urlString: Decoder<string> = /* #__PURE__ */ regex(url_re, 'Must be URL');

/**
 * Accepts strings that are valid URLs, returns the value as a URL instance.
 */
export const url: Decoder<URL> = select(unknown, (blob) =>
  typeof blob === 'string'
    ? /* #__PURE__ */ urlString.transform((s) => new URL(s))
    : /* #__PURE__ */ instanceOf(URL).describe('Must be URL'),
);

/**
 * Accepts strings that are valid URLs, but only HTTPS ones. Returns the value
 * as a URL instance.
 */
export const httpsUrl: Decoder<URL> = /* #__PURE__ */ url.refine(
  (value) => value.protocol === 'https:',
  'Must be HTTPS URL',
);

/**
 * Accepts and returns strings that are valid identifiers in most programming
 * languages.
 */
export const identifier: Decoder<string> = regex(
  /^[a-z_][a-z0-9_]*$/i,
  'Must be valid identifier',
);

/**
 * Accepts and returns [Nano ID](https://zelark.github.io/nano-id-cc) string
 * values. By default, expects a standard 21-char nanoid, but you can
 * optionally specify different size constraints. It assumes the default nanoid
 * alphabet.
 */
/* #__NO_SIDE_EFFECTS__ */
export function nanoid(options?: SizeOptions): Decoder<string> {
  return sized(regex(/^[a-z0-9_-]+$/i, 'Must be nano ID'), options ?? { size: 21 });
}

/**
 * Accepts strings that are valid
 * [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
 * (universally unique identifier).
 */
export const uuid: Decoder<string> = regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  'Must be uuid',
);

/**
 * Like `uuid`, but only accepts
 * [UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29)
 * strings.
 */
export const uuidv1: Decoder<string> =
  /* #__PURE__ */
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address)
  uuid.refine((value) => value[14] === '1', 'Must be uuidv1');

/**
 * Like `uuid`, but only accepts
 * [UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29)
 * strings.
 */
export const uuidv4: Decoder<string> =
  /* #__PURE__ */
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
  uuid.refine((value) => value[14] === '4', 'Must be uuidv4');

/**
 * Accepts and returns strings with decimal digits only (base-10).
 * To convert these to numbers, use the `numeric` decoder.
 */
export const decimal: Decoder<string> = regex(/^[0-9]+$/, 'Must only contain digits');

/**
 * Accepts and returns strings with hexadecimal digits only (base-16).
 */
export const hexadecimal: Decoder<string> = regex(
  /^[0-9a-f]+$/i,
  'Must only contain hexadecimal digits',
);

/**
 * Accepts valid numerical strings (in base-10) and returns them as a number.
 * To only accept numerical strings and keep them as string values, use the
 * `decimal` decoder.
 */
export const numeric: Decoder<number> = /* #__PURE__ */ decimal.transform(Number);
