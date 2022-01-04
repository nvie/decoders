import { Decoder } from '../_types';

export function never(msg: string): Decoder<never>;
export function fail(msg: string): Decoder<never>;
