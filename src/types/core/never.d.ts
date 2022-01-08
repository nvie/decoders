import { Decoder } from '../_decoder';

export function never(msg: string): Decoder<never>;
export function fail(msg: string): Decoder<never>;
