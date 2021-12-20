/// <reference lib="dom" />

import { Decoder } from '../_types';

export const string: Decoder<string>;
export const nonEmptyString: Decoder<string>;
export function regex(regex: RegExp, msg: string): Decoder<string>;
export const email: Decoder<string>;
export const url: Decoder<URL>;
export const httpsUrl: Decoder<URL>;
