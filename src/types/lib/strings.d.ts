/// <reference lib="dom" />

import { Decoder } from '../Decoder';

export const string: Decoder<string>;
export const nonEmptyString: Decoder<string>;
export function regex(regex: RegExp, msg: string): Decoder<string>;
export const email: Decoder<string>;
export const url: Decoder<URL>;
export const httpsUrl: Decoder<URL>;
export const uuid: Decoder<string>;
export const uuidv1: Decoder<string>;
export const uuidv4: Decoder<string>;
