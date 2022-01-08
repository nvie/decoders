import { Decoder, Scalar } from '../_decoder';

// Constants

export const null_: Decoder<null>;
export const undefined_: Decoder<undefined>;
export function constant<T extends Scalar>(value: T): Decoder<T>;
export function always<T extends Scalar>(value: T): Decoder<T>;
export function always<T>(value: T): Decoder<T>;
export function hardcoded<T extends Scalar>(value: T): Decoder<T>;
export function hardcoded<T>(value: T): Decoder<T>;
export const mixed: Decoder<unknown>;
export const unknown: Decoder<unknown>;
