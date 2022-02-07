/// <reference lib="dom" />

import { Decoder } from '../Decoder';

/**
 * Accepts and returns strings.
 */
export const string: Decoder<string>;

/**
 * Like `string`, but will reject the empty string or strings containing only whitespace.
 */
export const nonEmptyString: Decoder<string>;

/**
 * Accepts and returns strings that match the given regular expression.
 */
export function regex(regex: RegExp, msg: string): Decoder<string>;

/**
 * Accepts and returns strings that are syntactically valid email addresses.
 * (This will not mean that the email address actually exist.)
 */
export const email: Decoder<string>;

/**
 * Accepts strings that are valid URLs, returns the value as a URL instance.
 */
export const url: Decoder<URL>;

/**
 * Accepts strings that are valid URLs, but only HTTPS ones. Returns the value
 * as a URL instance.
 */
export const httpsUrl: Decoder<URL>;

/**
 * Accepts strings that are valid
 * [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
 * (universally unique identifier).
 */
export const uuid: Decoder<string>;

/**
 * Like `uuid`, but only accepts
 * [UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29)
 * strings.
 */
export const uuidv1: Decoder<string>;

/**
 * Like `uuid`, but only accepts
 * [UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29)
 * strings.
 */
export const uuidv4: Decoder<string>;
