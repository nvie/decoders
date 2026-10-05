import type { CallableDecoder, Decoder } from '~/core';
import { callable, define } from '~/core';
import type { RangeOptions, RegexOptions, SizeOptions } from '~/lib/options';
import { bySizeOptions } from '~/lib/options';
import { sized } from '~/misc';
import { natural, ranged } from '~/numbers';
import { isString } from '~/lib/utils';

import { instanceOf } from './misc';
import { select } from './unions';
import { unknown } from './basics';

const url_re =
  /* #__PURE__ */
  /^[A-Za-z]{2,12}(?:[+][A-Za-z]{2,12})?:\/\/(?:[^@]*@)?[A-Za-z0-9.-]+(?::[0-9]{2,5})?(?:\/[-+~%/.,!$&'()*:;=@\w]*(?:\?[-+~%/.,!$&'()*:;=@?\w]*)?)?(?:#[^\s#]*)?$/;
//   scheme           +sub              ://      usr:pass@               :port            /path                       ?query                               #fragment
//                                                       host

/**
 * Accepts and returns strings.
 */
export const string: CallableDecoder<string, SizeOptions> = /* #__PURE__ */ callable(
  define((blob, ok, err) => (isString(blob) ? ok(blob) : err('Must be string'))),
  sized,
);

/**
 * Like `string`, but will reject the empty string or strings containing only whitespace.
 */
export const nonEmptyString: CallableDecoder<string, SizeOptions> =
  /* #__PURE__ */ sizedRegex(/\S/, 'Must be non-empty string');

/**
 * Accepts strings and returns them with surrounding whitespace removed. Size
 * options apply to the trimmed value.
 */
export const trimmed: CallableDecoder<string, SizeOptions> = /* #__PURE__ */ callable(
  string.transform((s) => s.trim()),
  sized,
);

/**
 * Accepts and returns strings that match the given regular expression.
 * Size options are checked before the regex runs.
 */
export function regex(regex: RegExp, options?: RegexOptions): Decoder<string>;
/** Shorthand for `regex(re, { message })` */
export function regex(regex: RegExp, msg: string): Decoder<string>;
/* #__NO_SIDE_EFFECTS__ */
export function regex(regex: RegExp, options?: RegexOptions | string): Decoder<string> {
  const { message = `Must match ${regex}`, ...sizeOptions } =
    typeof options === 'string' ? { message: options } : (options ?? {});
  const hasBounds =
    sizeOptions.size !== undefined ||
    sizeOptions.min !== undefined ||
    sizeOptions.max !== undefined;
  const base = hasBounds ? string.reject(bySizeOptions(sizeOptions)) : string;
  return base.refine((s) => regex.test(s), message);
}

/**
 * A callable regex decoder: calling it with size options gives a decoder that
 * checks those before the regex runs.
 */
/* #__NO_SIDE_EFFECTS__ */
function sizedRegex(re: RegExp, message: string): CallableDecoder<string, SizeOptions> {
  return callable(regex(re, { message }), (_, options) =>
    regex(re, { ...options, message }),
  );
}

/**
 * Accepts and returns strings that start with the given prefix. Size options
 * count the whole string, prefix included, and are checked first.
 */
/* #__NO_SIDE_EFFECTS__ */
export function startsWith<P extends string>(
  prefix: P,
  options?: SizeOptions,
): Decoder<`${P}${string}`> {
  return (options ? string(options) : string).refine(
    (s): s is `${P}${string}` => s.startsWith(prefix),
    `Must start with '${prefix}'`,
  );
}

/**
 * Accepts and returns strings that end with the given suffix. Size options
 * count the whole string, suffix included, and are checked first.
 */
/* #__NO_SIDE_EFFECTS__ */
export function endsWith<S extends string>(
  suffix: S,
  options?: SizeOptions,
): Decoder<`${string}${S}`> {
  return (options ? string(options) : string).refine(
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
  /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}]|(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/,
  { message: 'Must be email' },
);

/**
 * Accepts strings that are valid URLs.
 */
export const urlString: Decoder<string> = /* #__PURE__ */ regex(url_re, {
  message: 'Must be URL',
});

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
export const identifier: CallableDecoder<string, SizeOptions> =
  /* #__PURE__ */ sizedRegex(/^[a-z_][a-z0-9_]*$/i, 'Must be valid identifier');

/**
 * Accepts and returns [Nano ID](https://zelark.github.io/nano-id-cc) string
 * values. By default, expects a standard 21-char nanoid, but you can
 * optionally specify different size constraints. It assumes the default nanoid
 * alphabet.
 */
/* #__NO_SIDE_EFFECTS__ */
export function nanoid(options?: SizeOptions): Decoder<string> {
  return regex(/^[a-z0-9_-]+$/i, {
    ...(options ?? { size: 21 }),
    message: 'Must be nano ID',
  });
}

/**
 * Accepts strings that are valid
 * [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
 * (universally unique identifier).
 */
export const uuid: Decoder<string> = regex(
  // https://www.rfc-editor.org/rfc/rfc9562#section-4
  // Version 1-8 with variant 8, 9, a, or b, plus the Nil and Max UUIDs (sections 5.9, 5.10)
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i,
  { message: 'Must be uuid' },
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
export const decimal: CallableDecoder<string, SizeOptions> = /* #__PURE__ */ sizedRegex(
  /^[0-9]+$/,
  'Must only contain digits',
);

/**
 * Accepts and returns strings with hexadecimal digits only (base-16).
 */
export const hexadecimal: CallableDecoder<string, SizeOptions> =
  /* #__PURE__ */ sizedRegex(/^[0-9a-f]+$/i, 'Must only contain hexadecimal digits');

/**
 * Accepts valid numerical strings (in base-10) and returns them as a safe
 * natural number. Range options apply to the number, not to the string.
 * To only accept numerical strings and keep them as string values, use the
 * `decimal` decoder.
 */
export const numeric: CallableDecoder<number, RangeOptions> = /* #__PURE__ */ callable(
  /* #__PURE__ */ decimal.transform(Number).pipe(natural),
  ranged,
);
